import forge from "node-forge";
import { StorageUtils as storage } from "../utils/storage";

interface ApiEndpoint {
   urlPrefix: string;
   httpsSupport: boolean;
   delay: number;
   requireHeader?: {
      [key: string]: {
         assign: string;
      };
   };
}

class ApiService {
   private selectedEndpoint: ApiEndpoint | null = null;
   private endpoints: Map<string, ApiEndpoint> = new Map();

   async fillEndpoints(json: any): Promise<void> {
      for (const key in json)
         if (json.hasOwnProperty(key))
            this.endpoints.set(key, json[key]);
   }

   async selectTheBest(): Promise<void> {
      this.endpoints.values().toArray()
         .sort((a, b) => a.delay - b.delay)
         .filter((d, i) => i == 0)
         .forEach(d => this.selectedEndpoint = d);
   }

   async initialize(): Promise<void> {
      if (this.selectedEndpoint) return;

      const apiJson = storage.getApiJson();

      if (apiJson) {
         console.debug("from storage");

         await this.fillEndpoints(JSON.parse(apiJson));
      } else { // 从网络获取
         console.debug("from network");

         const response = await fetch('https://i.kinwaa.cn/apis.json');

         if (response.ok)
            await this.fillEndpoints(await response.json());

         storage.setApiJson(JSON.stringify(Object.fromEntries(this.endpoints)));
      }

      await this.selectTheBest();
   }

   private async ensureInitialized(): Promise<void> {
      if (!this.selectedEndpoint) {
         await this.initialize();
      }
   }

   private async removeEndpoint(endpoint: ApiEndpoint): Promise<void> {
      const md = forge.md.sha1.create();
      md.update(endpoint.urlPrefix);
      const key = md.digest().toHex();

      console.debug(`remove by ${key}`);

      this.endpoints.delete(key);

      storage.setApiJson(JSON.stringify(Object.fromEntries(this.endpoints)));

      await this.selectTheBest();
   }

   private async request(endpoint: string, options: RequestInit = {}): Promise<string> {
      await this.ensureInitialized();

      if (!this.selectedEndpoint) {
         throw new Error('No API endpoint available');
      }

      const url = `${this.selectedEndpoint.urlPrefix}${endpoint}`;
      const defaultHeaders = {
         "Content-Type": "application/json",
         // "ngrok-skip-browser-warning": "1",
         ...options.headers,
         ...this.selectedEndpoint.requireHeader
      };

      console.debug("最终header: ", defaultHeaders);

      try {
         const response = await fetch(url, {
            ...options,
            headers: defaultHeaders
         });

         if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
         }

         const result: { data: string } = await response.json();

         return result.data;
      } catch (error) {
         console.warn(`当前endpoint[${this.selectedEndpoint.urlPrefix}]访问失败，移除后重试`);

         await this.removeEndpoint(this.selectedEndpoint);

         return await this.request(endpoint, options);
      }
   }

   // 获取服务器公钥
   async pubKey(): Promise<string> {
      return this.request("/pub-key");
   }

   // 握手接口
   async join(params: { clientId: string; timestamp: string; random: string; pubKey: string; signature: string; }): Promise<string> {
      return this.request("/join", { method: "POST", body: JSON.stringify(params) });
   }
}

export const apiService = new ApiService();
