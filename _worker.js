const PASSWORD = PASSWORD_ENV; // 从环境变量中获取密码

addEventListener("fetch", event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    // 如果是 POST 请求，处理文件上传
    if (request.method === "POST") {
        return await handleFileUpload(request);
    }

    // 如果是访问子链接，显示 CSV 文件内容
    const url = new URL(request.url);
    if (url.pathname.startsWith("/csv/")) {
        return await handleCsvContent(url);
    }

    // 默认返回 HTML 页面，包括上传表单
    const htmlContent = await getHtmlPage();
    return new Response(htmlContent, {
        headers: {
            "Content-Type": "text/html;charset=UTF-8"
        }
    });
}

// 处理上传的 CSV 文件
async function handleFileUpload(request) {
    const formData = await request.formData();
    const file = formData.get("file");
    const id = formData.get("id");
    const password = formData.get("password");

    // 验证密码
    if (password !== PASSWORD) {
        return new Response("密码错误", { status: 403 });
    }

    if (!file || !id) {
        return new Response("没有上传文件或没有指定 ID", { status: 400 });
    }

    const text = await file.text();

    // 将上传的 CSV 内容保存到 KV 存储，使用固定的 ID
    await CSV_STORAGE.put(id, text);

    // 返回上传成功后的页面内容，并包含指向子链接的 URL
    const responseContent = `
        <h2>CSV 文件上传成功！</h2>
        <p>点击以下链接查看上传的 CSV 文件：</p>
        <a href="/csv/${id}.csv">查看上传的 CSV 内容</a>
    `;
    return new Response(responseContent, {
        headers: {
            "Content-Type": "text/html;charset=UTF-8"
        }
    });
}

// 获取 HTML 页面，显示上传表单
async function getHtmlPage() {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CSV 文件上传</title>
    <style>
        pre {
            white-space: pre-wrap; /* 让文本自动换行 */
            word-wrap: break-word; /* 长单词或URL自动换行 */
        }
    </style>
</head>
<body>
    <h1>上传 CSV 文件</h1>

    <!-- 上传按钮表单，包含 5 个上传按钮 -->
    <form id="upload-form" enctype="multipart/form-data">
        <label>密码：</label>
        <input type="password" id="password" name="password" required />
        <br>

        <label>上传文件 1：</label>
        <input type="file" name="file" accept=".csv" />
        <button type="submit" data-id="csv-content-1">上传 CSV 1</button>
        <br>

        <label>上传文件 2：</label>
        <input type="file" name="file" accept=".csv" />
        <button type="submit" data-id="csv-content-2">上传 CSV 2</button>
        <br>

        <label>上传文件 3：</label>
        <input type="file" name="file" accept=".csv" />
        <button type="submit" data-id="csv-content-3">上传 CSV 3</button>
        <br>

        <label>上传文件 4：</label>
        <input type="file" name="file" accept=".csv" />
        <button type="submit" data-id="csv-content-4">上传 CSV 4</button>
        <br>

        <label>上传文件 5：</label>
        <input type="file" name="file" accept=".csv" />
        <button type="submit" data-id="csv-content-5">上传 CSV 5</button>
    </form>

    <h2>引用请注明出处</h2>
    <ul>
        <li><a href="https://www.youtube.com/@set-out" target="_blank">SO启程YouTube</a></li>
        <li><a href="https://github.com/Setout8" target="_blank">SO启程Github</a></li>
        <li><a href="https://t.me/Setout_group" target="_blank">SO启程Telegram</a></li>
        <li><a href="https://set-out8.blogspot.com" target="_blank">SO启程blogspot</a></li>
    </ul>

    <script>
        document.querySelectorAll("button").forEach(button => {
            button.addEventListener("click", async (event) => {
                event.preventDefault(); // 防止表单默认提交行为

                const formData = new FormData();
                const fileInput = button.previousElementSibling;
                const passwordInput = document.getElementById("password");

                formData.append("file", fileInput.files[0]);
                formData.append("id", button.getAttribute("data-id"));
                formData.append("password", passwordInput.value);

                const response = await fetch(window.location.href, {
                    method: "POST",
                    body: formData,
                });

                if (response.ok) {
                    const htmlContent = await response.text();
                    // 显示上传成功后的链接
                    document.body.innerHTML = htmlContent;
                } else {
                    alert("文件上传失败！" + (response.status === 403 ? " 密码错误。" : ""));
                }
            });
        });
    </script>
</body>
</html>
    `;
}

// 处理获取子链接内容
async function handleCsvContent(url) {
    // 从 URL 中提取固定的 ID
    const pathSegments = url.pathname.split("/");

    if (pathSegments.length < 3) {
        return new Response("无效的 URL", { status: 400 });
    }

    const idWithExtension = pathSegments[2];
    const id = idWithExtension.replace(".csv", ""); // 去除 `.csv` 后缀

    // 从 KV 存储中获取保存的 CSV 内容
    const csvContent = await CSV_STORAGE.get(id, "text");

    if (!csvContent) {
        return new Response("找不到对应的 CSV 文件", { status: 404 });
    }

    // 只返回保存的 CSV 内容，不显示其他内容
    return new Response(csvContent, {
        headers: {
            "Content-Type": "text/plain;charset=UTF-8"
        }
    });
}
