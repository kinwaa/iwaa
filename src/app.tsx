import { MetaProvider, Title } from "@solidjs/meta";
import { Router, Route } from "@solidjs/router";
import { onMount, Suspense, createSignal } from "solid-js";
import forge from "node-forge";
import { v7 as uuid } from "uuid";
import { StorageUtils as storage } from "./utils/storage";
import { apiService } from "./services/api";
import "./app.css";
import Home from "./routes/index";
import NotFound from "./routes/[...404]";
import DateTool from "./routes/date-tool";

function ensureCientId(pubKeySup: () => forge.pki.rsa.PublicKey): string {
   let encodedClientId = storage.getClientId(); // 可以获取的话，是用服务器公钥加密了的

   if (!encodedClientId) {
      const pubKey = pubKeySup();
      encodedClientId = forge.util.encode64(pubKey.encrypt(forge.util.encodeUtf8(uuid().replaceAll("-", "")), "RSA-OAEP", {
         md: forge.md.sha256.create(),
         mgf1: {
            md: forge.md.sha256.create()
         }
      }));

      console.debug("加密了的clientId: ", encodedClientId);
      storage.setClientId(encodedClientId);
   }

   return encodedClientId;
}

export default function App() {
   const [keyPair, setKeyPair] = createSignal<forge.pki.rsa.KeyPair | null>(null);
   const [srvPubKey, setSrvPubKey] = createSignal<forge.pki.rsa.PublicKey | null>(null);
   const [clientId, setClientId] = createSignal<string | null>(null); // 只存解密后的clientId

   async function fetchPubKey(): Promise<forge.pki.rsa.PublicKey> {
      const startAt = performance.now();
      console.info(`获取公钥开始: ${startAt}`);

      const result = await apiService.pubKey();
      const pubKey = forge.pki.publicKeyFromPem(result);

      setSrvPubKey(pubKey);

      const endAt = performance.now();
      console.info(`获取公钥耗时 ${endAt - startAt} 毫秒`);

      return pubKey;
   }

   async function genKeyPair(): Promise<forge.pki.rsa.KeyPair> {
      const startAt = performance.now();
      console.info(`生成密钥对开始: ${startAt}`);

      const pair = forge.pki.rsa.generateKeyPair({ bits: 2048 });

      const endAt = performance.now();
      console.info(`生成密钥对耗时 ${endAt - startAt} 毫秒`);

      return pair;
   }

   async function joinAction(encodedClientId: string, pair: forge.pki.rsa.KeyPair): Promise<void> {
      const timestamp = Date.now().toString();
      const randomStr = "1";
      const pubKeyPem = forge.pki.publicKeyToPem(pair.publicKey);
      const message = encodedClientId + timestamp + randomStr + pubKeyPem;

      // 签名
      let md = forge.md.sha256.create();
      md.update(message, "utf8");
      const signature = forge.util.encode64(pair.privateKey.sign(md));

      const result = await apiService.join({
         clientId: encodedClientId!,
         timestamp,
         random: randomStr,
         pubKey: pubKeyPem,
         signature,
      });

      if (result) {
         console.info("与后端握手成功");

         const encryptedBytes = forge.util.decode64(result);
         const decryptedBytes = pair.privateKey.decrypt(encryptedBytes, 'RSA-OAEP', {
            md: forge.md.sha256.create(),
            mgf1: {
               md: forge.md.sha256.create()
            }
         });

         setClientId(forge.util.decodeUtf8(decryptedBytes)); // 解密后的clientId
      }
   }

   onMount(async () => {
      const startAt = performance.now();
      console.info("初始化开始: ", startAt);

      // 并行：获取后端接口的公钥、生成当前的密钥对
      const [ pubKey, pair ] = await Promise.all([ fetchPubKey(), genKeyPair() ]);

      let encodedClientId = ensureCientId(() => pubKey!);

      // 与后端接口握手
      await joinAction(encodedClientId, pair);

      const endAt = performance.now();
      console.info(`初始化耗时 ${endAt - startAt} 毫秒`);
   });

   return (
      <Router
         root={props => (
            <MetaProvider>
               <Title>SolidStart - Basic</Title>
               <nav>
                  <a href="/">首页</a>
                  <a href="/date-tool">日期工具</a>
               </nav>
               <Suspense>{props.children}</Suspense>
            </MetaProvider>
         )}
      >
         <Route path="/" component={Home} />
         <Route path="/date-tool" component={DateTool} />
         <Route path="*" component={NotFound} />
      </Router>
   );
}
