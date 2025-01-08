addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const ipAddresses = `
46.137.215.228:443#优选SG1
13.228.142.218:443#优选SG1
47.130.47.224:443#优选SG1
13.229.159.215:443#优选SG1
175.41.148.129:443#优选SG1
  `.trim();

  return new Response(ipAddresses, {
      headers: { "Content-Type": "text/plain" },
  });
}
