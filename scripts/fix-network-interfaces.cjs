// 容器/Android 环境下 os.networkInterfaces() 会抛 EACCES（uv_interface_addresses），
// 而 Remotion 启动预览服务器时会调用它。这里包一层，失败就返回空对象。
const os = require("node:os");

const original = os.networkInterfaces;

os.networkInterfaces = function patchedNetworkInterfaces() {
  try {
    return original.call(os) ?? {};
  } catch {
    return {};
  }
};

module.exports = {};
