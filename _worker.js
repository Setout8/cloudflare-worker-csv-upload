const PASSWORD = PASSWORD_ENV || "pass1234"; // 从环境变量中获取密码，默认为"pass1234"
const PATH_PREFIX = PATH_PREFIX_ENV || "/abc123/"; // 从环境变量中获取路径前缀，默认为 "/abc123/"

addEventListener("fetch", event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    if (request.method === "POST") {
        return await handleFileOrTextUpload(request);
    }

    const url = new URL(request.url);
    if (url.pathname.startsWith(PATH_PREFIX)) {
        return await handleContentDisplay(url);
    }

    const htmlContent = await getHtmlPage();
    return new Response(htmlContent, {
        headers: {
            "Content-Type": "text/html;charset=UTF-8"
        }
    });
}

// 处理文件或文本内容的上传
async function handleFileOrTextUpload(request) {
    const formData = await request.formData();
    const password = formData.get("password");

    if (password !== PASSWORD) {
        return new Response("密码错误", { status: 403 });
    }

    const id = formData.get("id");
    if (!id) {
        return new Response("没有指定 ID", { status: 400 });
    }

    const file = formData.get("file");
    const text = formData.get("text");
    let content = "";

    if (file) {
        content = await file.text();
    } else if (text) {
        content = text;
    } else {
        return new Response("没有上传文件或输入文本内容", { status: 400 });
    }

    await CSV_STORAGE.put(id, content);

    const responseContent = `
        <h2>${file ? "CSV 文件" : "文本内容"}上传成功！</h2>
        <p>点击以下链接查看内容：</p>
        <a href="${PATH_PREFIX}${id}${file ? ".csv" : ".txt"}">查看上传的 ${file ? "CSV 文件" : "文本内容"}</a>
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
    <title>文件和文本上传</title>
</head>
<body>
    <h1>上传 CSV 文件或文本内容</h1>

    <!-- 文件上传表单 -->
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
        <br>

        <h2>输入文本内容</h2>
        <textarea id="text-content" rows="5" cols="50" placeholder="输入文本内容..."></textarea>
        <button type="submit" data-id="text-content">上传文本内容</button>
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
            button.addEventListener("click", async event => {
                event.preventDefault();

                const formData = new FormData();
                const fileInput = button.previousElementSibling;
                const passwordInput = document.getElementById("password");
                const textContent = document.getElementById("text-content");

                if (button.getAttribute("data-id") === "text-content") {
                    if (!textContent.value.trim()) {
                        alert("请输入文本内容！");
                        return;
                    }
                    formData.append("text", textContent.value);
                } else if (fileInput && fileInput.files.length > 0) {
                    formData.append("file", fileInput.files[0]);
                } else {
                    alert("请选择文件或输入文本内容！");
                    return;
                }

                formData.append("id", button.getAttribute("data-id"));
                formData.append("password", passwordInput.value);

                const response = await fetch(window.location.href, {
                    method: "POST",
                    body: formData,
                });

                if (response.ok) {
                    const htmlContent = await response.text();
                    document.body.innerHTML = htmlContent;
                } else {
                    alert("上传失败：" + (response.status === 403 ? "密码错误。" : ""));
                }
            });
        });
    </script>
</body>
</html>
    `;
}

// 处理显示内容
async function handleContentDisplay(url) {
    if (!url.pathname.startsWith(PATH_PREFIX)) {
        return new Response("路径前缀无效", { status: 403 });
    }

    const pathSegments = url.pathname.split("/");
    if (pathSegments.length < 3) {
        return new Response("无效的 URL", { status: 400 });
    }

    const idWithExtension = pathSegments[2];
    const id = idWithExtension.replace(/\.(csv|txt)$/, "");

    const content = await CSV_STORAGE.get(id, "text");
    if (!content) {
        return new Response("找不到对应的内容", { status: 404 });
    }

    const contentType = idWithExtension.endsWith(".csv") ? "text/plain;charset=UTF-8" : "text/plain;charset=UTF-8";
    return new Response(content, { headers: { "Content-Type": contentType } });
}
