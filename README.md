# CSV 文件上传与查看（Cloudflare Worker）
这是一个基于 Cloudflare Worker 实现的项目，用于上传和查看 CSV 文件。用户可以最多上传5个 CSV 文件并通过生成的5个固定的 URL 来查看内容。还可以在线编辑一个文本，保存后生成1个固定的 URL 来杳看内容。上传的文件会保存在 Cloudflare KV 存储中，直到下次上传新文件。
![image](https://github.com/user-attachments/assets/3c6f7887-0d51-46df-aebd-67d53e60d7c2)

## 功能
- **上传 CSV 文件**：用户可以通过网页表单上传 CSV 文件。
- **密码保护**：上传时需要输入密码，防止未授权上传。
- **查看 CSV 文件内容**：上传后生成链接，用户可以查看 CSV 文件内容，也可以方便其他程序在链接上抓取 csv 文件 API。
- **在线编辑文本**：在线编辑文本保存后，生成一个 URL 。
- **自定义部分 URL 路径**：防止被别人盗用链接的内容。

## 项目结构
- `_worker.js`：主程序代码，处理文件上传、CSV 存储、在线编辑文本、自定义部分 URL 、显示文件内容、在生成 URL ，被其他程序 API 抓取等逻辑。
- `README.md`：项目说明文件，解释项目的使用和结构。

## 使用方法
1. 访问你的 Worker URL。
2. 使用上传表单上传 CSV 文件。
3. 上传后会生成一个链接，最多可生成5个连接，点击可以查看上传的 CSV 文件内容。
4. 在线编辑文本，保存后生成1个连接。
5. 引用请注明出处：SO启程Github（https://github.com/Setout8/cloudflare-worker-csv-upload）

### 部署到 Cloudflare Worker [部署操作视频](https://youtu.be/JBGavkjzaQE))
1. [创建 Cloudflare Worker](https://workers.cloudflare.com/) 账户并登录。
2. 创建新的 Worker 项目，保持里面默认的代码。如没有默认代码，临时使用 `Hello World!.js` 。
3. 在 Cloudflare Worker 控制面板中配置环境变量（`PASSWORD_ENV`）为你的密码，值：随意 (建议字母数字组合)，如：pass1234。
4. 在 Cloudflare Worker 控制面板中配置环境变量（`PATH_PREFIX_ENV`）为你的部分自定义路径，值：/随意/ (建议字母数字组合)，如：/abc123/。
5. 使用 `KV` 存储来保存上传的 CSV 文件内容，新建变量名称（`CSV_STORAGE`）来绑定。
6. 再打开刚创建的项目，将 `_worker.js` 文件内容粘贴到 Worker 编辑器中，保存并部署，访问 URL 即可。

### 运行本地开发环境
1. 克隆项目到本地：
   ```bash
   git clone https://github.com/yourusername/csv-upload-cloudflare-worker.git
   cd csv-upload-cloudflare-worker
