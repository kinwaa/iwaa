import { Title } from "@solidjs/meta";
import { createSignal, onCleanup, createEffect } from "solid-js";
import { Box, Typography, Card, CardContent, TextField, Select, MenuItem, FormControl, InputLabel, Button } from "@suid/material";

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
   const [precision, setPrecision] = createSignal<Precision>("milliseconds");
   const [dateInputValue, setDateInputValue] = createSignal("");

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

   // 当精度改变时，重新格式化日期输入值
   createEffect(() => {
      const val = dateInputValue();
      if (!val) return;

      const date = new Date(val);
      if (isNaN(date.getTime())) return;

      const formatted = formatDateForInput(date, precision());
      if (formatted !== val) {
         setDateInputValue(formatted);
      }
   });

   return (
      <Box sx={{ py: 4 }}>
         <Title>日期工具</Title>
         <Typography variant="h4" component="h1" gutterBottom>
            日期工具
         </Typography>

         {/* 精度控制 */}
         <Box sx={{ mb: 4 }}>
            <FormControl fullWidth>
               <InputLabel id="precision-select-label">日期精度</InputLabel>
               <Select
                  labelId="precision-select-label"
                  id="precision-select"
                  value={precision()}
                  label="日期精度"
                  onChange={onPrecisionChange}
               >
                  {precisionOptions.map(opt => (
                     <MenuItem value={opt.value}>
                        {opt.label}
                     </MenuItem>
                  ))}
               </Select>
            </FormControl>
         </Box>

         {/* 当前时间 */}
         <Card sx={{ mb: 4 }}>
            <CardContent>
               <Typography variant="h5" component="h2" gutterBottom>
                  当前时间
               </Typography>
               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="body1">
                     {formatDate(currentTime())}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                     <Typography variant="body1">
                        {tsFromDate(currentTime())}
                     </Typography>
                     <Button
                        variant="outlined"
                        size="small"
                        onClick={copyTimestamp}
                     >
                        {copyState().timestamp ? "已复制" : "复制"}
                     </Button>
                  </Box>
               </Box>
            </CardContent>
         </Card>

         {/* 时间戳转换 */}
         <Card sx={{ mb: 4 }}>
            <CardContent>
               <Typography variant="h5" component="h2" gutterBottom>
                  时间戳转换
               </Typography>
               <TextField
                  fullWidth
                  placeholder="输入时间戳"
                  value={timestamp()}
                  onChange={(e) => setTimestamp(e.target.value)}
                  variant="outlined"
                  sx={{ mb: 2 }}
               />
               <Typography variant="body1" sx={{ mt: 2 }}>
                  {convertTimestamp(timestamp())}
               </Typography>
            </CardContent>
         </Card>

         {/* 日期转时间戳 */}
         <Card sx={{ mb: 4 }}>
            <CardContent>
               <Typography variant="h5" component="h2" gutterBottom>
                  日期转时间戳
               </Typography>
               <TextField
                  fullWidth
                  type="datetime-local"
                  value={dateInputValue()}
                  onChange={(e) => setDateInputValue((e.target as HTMLInputElement).value)}
                  InputProps={{
                     inputProps: {
                        step: precision() === "milliseconds" ? "0.001" : "1"
                     }
                  }}
                  variant="outlined"
                  sx={{ mb: 2 }}
               />
               <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body1">
                     {dateToTimestamp()}
                  </Typography>
                  {dateToTimestamp() && (
                     <Button
                        variant="outlined"
                        size="small"
                        onClick={copyDateTimestamp}
                     >
                        {copyState().dateTimestamp ? "已复制" : "复制"}
                     </Button>
                  )}
               </Box>
            </CardContent>
         </Card>
      </Box>
   );
}
