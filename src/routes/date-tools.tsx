import { Title } from "@solidjs/meta";
import { createSignal, onCleanup, createEffect } from "solid-js";

// 精度类型定义
type Precision = "milliseconds" | "seconds";

// 复制状态类型定义
type CopyState = {
   [key: string]: boolean;
};

// 准备好的精度选项列表，可用于渲染下拉
const precisionOptions: { value: Precision; label: string }[] = [
   { value: "milliseconds", label: "毫秒" },
   { value: "seconds", label: "秒" },
];

export default function DateTool() {
   // 状态管理
   const [currentTime, setCurrentTime] = createSignal(new Date());
   const [timestamp, setTimestamp] = createSignal("");
   const [dateToTimestamp, setDateToTimestamp] = createSignal("");
   const [dateInputValue, setDateInputValue] = createSignal("");
   const [precision, setPrecision] = createSignal<Precision>("milliseconds");
   const [copyState, setCopyState] = createSignal<CopyState>({
      timestamp: false,
      dateTimestamp: false
   });

   // 实时更新当前时间
   const updateCurrentTime = () => {
      setCurrentTime(new Date());
   };

   // 启动/停止定时器，并根据页面可见性暂停
   let intervalId: ReturnType<typeof setInterval>;
   const startTimer = () => {
      stopTimer();
      intervalId = setInterval(updateCurrentTime, 1000);
   };
   const stopTimer = () => {
      if (intervalId) clearInterval(intervalId);
   };

   createEffect(() => {
      startTimer();
      const onVisibilityChange = () => {
         if (document.hidden) {
            stopTimer();
         } else {
            startTimer();
         }
      };
      document.addEventListener("visibilitychange", onVisibilityChange);
      onCleanup(() => {
         stopTimer();
         document.removeEventListener("visibilitychange", onVisibilityChange);
      });
   });

   // 通用复制函数
   const copyToClipboard = (text: string, key: keyof CopyState) => {
      navigator.clipboard.writeText(text)
         .then(() => {
            setCopyState(prev => ({
               ...prev,
               [key]: true
            }));
            setTimeout(() => {
               setCopyState(prev => ({
                  ...prev,
                  [key]: false
               }));
            }, 2000);
         })
         .catch(err => {
            console.error("复制失败:", err);
         });
   };

   // 复制当前时间戳
   const copyTimestamp = () => {
      const ts = tsFromDate(currentTime());
      copyToClipboard(ts.toString(), "timestamp");
   };

   // 复制日期转时间戳结果到剪贴板
   const copyDateTimestamp = () => {
      if (dateToTimestamp()) {
         copyToClipboard(dateToTimestamp(), "dateTimestamp");
      }
   };

   // 格式化日期时间
   const formatDate = (date: Date) => {
      const baseFormat = date.toLocaleString();
      return precision() === "milliseconds"
         ? `${baseFormat}.${date.getMilliseconds().toString().padStart(3, "0")}`
         : baseFormat;
   };

   // 根据当前精度从 Date 获取时间戳
   const tsFromDate = (date: Date) =>
      precision() === "milliseconds"
         ? date.getTime()
         : Math.floor(date.getTime() / 1000);

   // 转换时间戳为日期（只允许数字）
   const convertTimestamp = (ts: string) => {
      if (!ts) return "";
      if (!/^\d+$/.test(ts)) {
         return "无效的时间戳";
      }

      const numTs = parseInt(ts, 10);
      const isSeconds = ts.length === 10;
      const date = new Date(isSeconds ? numTs * 1000 : numTs);

      // 检查日期是否有效
      if (isNaN(date.getTime())) {
         return "无效的时间戳";
      }

      return formatDate(date);
   };

   // 精度改变处理
   const onPrecisionChange = (e: Event) => {
      setPrecision((e.target as HTMLSelectElement).value as Precision);
   };

   // 格式化日期为输入框格式
   const formatDateForInput = (date: Date, precision: Precision): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");
      const milliseconds = String(date.getMilliseconds()).padStart(3, "0");

      return precision === "milliseconds"
         ? `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`
         : `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
   };

   // 日期输入和精度关联：
   // 1. 输入改变时自动更新 timestamp
   // 2. 精度改变时调整输入格式
   createEffect(() => {
      const val = dateInputValue();
      if (!val) {
         setDateToTimestamp("");
         return;
      }

      const date = new Date(val);
      if (isNaN(date.getTime())) {
         setDateToTimestamp("");
         return;
      }

      const ts = tsFromDate(date);
      setDateToTimestamp(ts.toString());

      // 重格式化输入框使得精度切换后符合要求
      const formatted = formatDateForInput(date, precision());
      if (formatted !== val) {
         setDateInputValue(formatted);
      }
   });

   return (
      <main class="date-tool">
         <Title>日期工具</Title>
         <h1>日期工具</h1>

         {/* 精度控制 */}
         <div class="precision-control">
            <label for="precision-select">日期精度：</label>
            <select
               id="precision-select"
               value={precision()}
               onchange={onPrecisionChange}
            >
               {precisionOptions.map(opt => (
                  <option value={opt.value}>{opt.label}</option>
               ))}
            </select>
         </div>

         {/* 当前时间 */}
         <div class="current-time">
            <h2>当前时间</h2>
            <div class="time-display">
               <span>{formatDate(currentTime())}</span>
               <div class="timestamp">
                  {tsFromDate(currentTime())}
                  <button
                     class="copy-btn"
                     onclick={copyTimestamp}
                     title="复制时间戳"
                     aria-label="复制时间戳"
                  >
                     {copyState().timestamp ? "已复制" : "复制"}
                  </button>
               </div>
            </div>
         </div>

         {/* 时间戳转换 */}
         <div class="timestamp-converter">
            <h2>时间戳转换</h2>
            <input
               type="text"
               placeholder="输入时间戳"
               value={timestamp()}
               oninput={(e) => setTimestamp(e.target.value)}
               aria-label="输入时间戳"
            />
            <div class="converted-date">
               {convertTimestamp(timestamp())}
            </div>
         </div>

         {/* 日期转时间戳 */}
         <div class="date-to-timestamp">
            <h2>日期转时间戳</h2>
            <input
               type="datetime-local"
               value={dateInputValue()}
               oninput={(e) => setDateInputValue((e.target as HTMLInputElement).value)}
               step={precision() === "milliseconds" ? "0.001" : "1"}
               aria-label="选择日期时间"
            />
            <div class="converted-timestamp">
               <span>{dateToTimestamp()}</span>
               {dateToTimestamp() && (
                  <button
                     class="copy-btn"
                     onclick={copyDateTimestamp}
                     title="复制时间戳"
                     aria-label="复制时间戳"
                  >
                     {copyState().dateTimestamp ? "已复制" : "复制"}
                  </button>
               )}
            </div>
         </div>
      </main>
   );
}
