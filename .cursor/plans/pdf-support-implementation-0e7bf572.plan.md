<!-- 0e7bf572-6e0c-45ce-baba-f08366b8a804 9b773e42-e671-4402-a1e1-f00b8d0e7458 -->
# PDF 支持实现计划

## 1. 修改文件上传 Hook

**文件**: `app/lib/hooks/useFileUpload.ts`

- 修改 `fileType` 接口，添加 `mimeType` 字段用于区分文件类型
- 在 `readFileAsBase64` 中返回文件的 MIME 类型
- 修改 `addFilesFromInput` 和 `addFilesFromPaste` 保存文件类型信息

## 2. 修改输入组件支持 PDF 上传

**文件**: `app/components/Conversation/ChatInput.tsx`

- 修改文件输入框 accept 属性：`accept="image/*,application/pdf"`（163行）
- 修改粘贴处理中的类型检查：`item.type === 'application/pdf'`（102行）
- 修改 `handleSend` 函数，根据文件 MIME 类型生成对应的 Content 类型：
  - 图片: `{type: 'image_url', image_url: {url: base64}}`
  - PDF: `{type: 'file', file: {filename: 'document.pdf', file_data: base64}}`
- 在显示上传文件时区分图片和 PDF，使用不同的预览组件

## 3. 创建 PDF 查看器组件

**文件**: `app/components/PDFViewer/PDFViewer.tsx`（新建）

- 创建简单的 PDF 预览组件，使用 `<embed>` 标签
- 支持点击放大查看（使用 Portal 和 Modal）
- 缩略图显示 PDF 图标和文件名
- 全屏模式使用 embed 标签展示完整 PDF

## 4. 修改消息预览组件

**文件**: `app/components/Preview/Preview.tsx`

- 在 `Preview` 组件中添加 `file` 类型的处理分支（79-84行附近）
- 渲染 PDF 时使用新的 PDFViewer 组件
- 保持图片继续使用 ImageViewer

## 5. 修改消息列表编辑功能

**文件**: `app/components/Conversation/MessageList.tsx`

- 修改编辑模式下的文件内容提取逻辑（61-65行）
- 支持同时提取 `image_url` 类型和 `file` 类型的内容
- 将文件内容和类型信息传递给 ChatInput

## 技术细节

### Content 类型使用

现有的 `useChatStore.ts` 已定义 `fileContent` 类型：

```typescript
interface fileContent {
  type: 'file';
  file: {
    filename: string;
    file_data: string;
  };
}
```

将充分利用此类型定义。

### PDF 预览方案

使用浏览器原生 `<embed>` 标签：

```tsx
<embed src={pdfUrl} type="application/pdf" width="100%" height="100%" />
```

### 文件类型检测

通过 File.type 属性判断：

- 图片: `file.type.startsWith('image/')`
- PDF: `file.type === 'application/pdf'`

### To-dos

- [ ] 修改 useFileUpload.ts，添加文件类型跟踪
- [ ] 创建 PDFViewer.tsx 组件
- [ ] 修改 ChatInput.tsx 支持 PDF 上传和区分显示
- [ ] 修改 Preview.tsx 支持渲染 PDF
- [ ] 修改 MessageList.tsx 支持编辑 PDF