addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  // CSV 数据
  const csvData = `
IP地址,端口,回源端口,TLS,数据中心,地区,国家,城市,TCP延迟(ms),速度(MB/s)
46.137.215.228,443,443,TRUE,SIN,AsiaPacific,SG,Singapore,56.95,30.26
13.228.142.218,443,443,TRUE,SIN,AsiaPacific,SG,Singapore,56.85,27.95
47.130.47.224,443,443,TRUE,SIN,AsiaPacific,SG,Singapore,58.29,27.81
13.229.159.215,443,443,TRUE,SIN,AsiaPacific,SG,Singapore,55.92,22.92
175.41.148.129,443,443,TRUE,SIN,AsiaPacific,SG,Singapore,56.59,1.56
  `.trim();

  // 返回 CSV 数据作为响应，使用 text/plain 以显示纯文本
  return new Response(csvData, {
      headers: { 
          "Content-Type": "text/plain" // 设置为纯文本
      }
  });
}
