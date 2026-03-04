import { Title } from "@solidjs/meta";
import { createSignal, onCleanup } from "solid-js";

export default function DateTool() {
  const [currentTime, setCurrentTime] = createSignal(new Date());
  const [timestamp, setTimestamp] = createSignal("");
  const [dateToTimestamp, setDateToTimestamp] = createSignal("");
  const [precision, setPrecision] = createSignal("milliseconds");
  const [copied, setCopied] = createSignal(false);
  const [dateCopied, setDateCopied] = createSignal(false);

  // 实时更新当前时间
  const updateCurrentTime = () => {
    setCurrentTime(new Date());
  };

  // 启动定时器
  const intervalId = setInterval(updateCurrentTime, 1000);
  onCleanup(() => clearInterval(intervalId));

  // 复制时间戳到剪贴板
  const copyTimestamp = () => {
    const ts = precision() === "milliseconds" ? currentTime().getTime() : Math.floor(currentTime().getTime() / 1000);
    navigator.clipboard.writeText(ts.toString())
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error("复制失败:", err);
      });
  };

  // 复制日期转时间戳结果到剪贴板
  const copyDateTimestamp = () => {
    if (dateToTimestamp()) {
      navigator.clipboard.writeText(dateToTimestamp())
        .then(() => {
          setDateCopied(true);
          setTimeout(() => setDateCopied(false), 2000);
        })
        .catch(err => {
          console.error("复制失败:", err);
        });
    }
  };

  // 格式化日期时间
  const formatDate = (date: Date) => {
    if (precision() === "milliseconds") {
      return date.toLocaleString() + "." + date.getMilliseconds().toString().padStart(3, "0");
    } else {
      return date.toLocaleString();
    }
  };

  // 转换时间戳为日期
  const convertTimestamp = (ts: string) => {
    if (!ts) return "";
    
    try {
      const numTs = parseInt(ts, 10);
      // 检查是否为秒级时间戳（长度为10位）
      const isSeconds = ts.length === 10;
      const date = new Date(isSeconds ? numTs * 1000 : numTs);
      return formatDate(date);
    } catch (error) {
      return "无效的时间戳";
    }
  };

  // 当精度改变时，重新计算时间戳并更新日期输入框
  const handlePrecisionChange = (e: Event) => {
    const target = e.target as HTMLSelectElement;
    setPrecision(target.value);
    // 根据当前输入的日期重新计算时间戳并更新输入框
    const dateInput = document.getElementById('dateInput') as HTMLInputElement;
    if (dateInput.value) {
      const date = new Date(dateInput.value);
      // 重新格式化日期输入框的值，以适应新的精度
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      const milliseconds = String(date.getMilliseconds()).padStart(3, '0');
      
      if (precision() === "milliseconds") {
        // 格式：YYYY-MM-DDTHH:MM:SS.mmm
        dateInput.value = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`;
      } else {
        // 格式：YYYY-MM-DDTHH:MM:SS
        dateInput.value = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
      }
      
      // 重新计算时间戳
      const ts = precision() === "milliseconds" ? date.getTime() : Math.floor(date.getTime() / 1000);
      setDateToTimestamp(ts.toString());
    } else {
      // 清空转换结果
      setDateToTimestamp("");
    }
  };

  return (
    <main class="date-tool">
      <Title>日期工具</Title>
      <h1>日期工具</h1>
      
      {/* 精度控制 */}
      <div class="precision-control">
        <label>日期精度：</label>
        <select value={precision()} onchange={handlePrecisionChange}>
          <option value="milliseconds">毫秒</option>
          <option value="seconds">秒</option>
        </select>
      </div>
      
      {/* 当前时间 */}
      <div class="current-time">
        <h2>当前时间</h2>
        <div class="time-display">
          <span>{formatDate(currentTime())}</span>
          <div class="timestamp">
            {precision() === "milliseconds" ? currentTime().getTime() : Math.floor(currentTime().getTime() / 1000)}
            <button 
              class="copy-btn" 
              onclick={copyTimestamp}
              title="复制时间戳"
            >
              {copied() ? "已复制" : "复制"}
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
          id="dateInput" 
          step={precision() === "milliseconds" ? "0.001" : "1"}
        />
        <button class="convert-btn" onclick={() => {
          const dateInput = document.getElementById('dateInput') as HTMLInputElement;
          if (dateInput.value) {
            const date = new Date(dateInput.value);
            const ts = precision() === "milliseconds" ? date.getTime() : Math.floor(date.getTime() / 1000);
            setDateToTimestamp(ts.toString());
          }
        }}>
          转换为时间戳
        </button>
        <div class="converted-timestamp">
          <span>{dateToTimestamp()}</span>
          {dateToTimestamp() && (
            <button 
              class="copy-btn" 
              onclick={copyDateTimestamp}
              title="复制时间戳"
            >
              {dateCopied() ? "已复制" : "复制"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
