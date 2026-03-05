import { Title } from "@solidjs/meta";
import { Box, Typography, Card, CardContent } from "@suid/material";

export default function Home() {
   return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
         <Title>Hello World</Title>
         <Typography variant="h3" component="h1" gutterBottom>
            欢迎使用 SolidJS + SUID
         </Typography>
         <Typography variant="body1" paragraph>
            这是一个使用 SolidJS 和 SUID 构建的应用程序。
         </Typography>
         <Card sx={{ maxWidth: 345, mx: 'auto', mt: 4 }}>
            <CardContent>
               <Typography variant="h5" component="h2" gutterBottom>
                  功能介绍
               </Typography>
               <Typography variant="body2" color="text.secondary">
                  本应用提供日期工具功能，可以帮助您进行时间戳转换和日期操作。
               </Typography>
            </CardContent>
         </Card>
      </Box>
   );
}
