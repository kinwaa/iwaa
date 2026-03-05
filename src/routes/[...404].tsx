import { Title } from "@solidjs/meta";
import { Box, Typography, Card, CardContent } from "@suid/material";

export default function NotFound() {
   return (
      <Box sx={{ py: 8, textAlign: 'center' }}>
         <Title>Not Found</Title>
         <Card sx={{ maxWidth: 400, mx: 'auto' }}>
            <CardContent>
               <Typography variant="h4" component="h1" gutterBottom>
                  页面未找到
               </Typography>
               <Typography variant="body1" paragraph>
                  您访问的页面不存在。
               </Typography>
               <Typography variant="body2" color="text.secondary" paragraph>
                  访问 SolidJS 官网了解如何构建 Solid 应用。
               </Typography>
               <a
                  href="https://solidjs.com"
                  target="_blank"
                  style={{
                     display: 'inline-block',
                     padding: '8px 16px',
                     "background-color": '#1976d2',
                     color: 'white',
                     "text-decoration": 'none',
                     "border-radius": '4px',
                     "margin-right": '8px',
                     "font-weight": '500'
                  }}
               >
                  访问 SolidJS
               </a>
               <a
                  href="/"
                  style={{
                     display: 'inline-block',
                     padding: '8px 16px',
                     "background-color": 'white',
                     color: '#1976d2',
                     "text-decoration": 'none',
                     "border-radius": '4px',
                     border: '1px solid #1976d2',
                     "font-weight": '500'
                  }}
               >
                  返回首页
               </a>
            </CardContent>
         </Card>
      </Box>
   );
}
