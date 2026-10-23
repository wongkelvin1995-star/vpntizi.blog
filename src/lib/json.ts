/** 把数据写进 <script type="application/json"> 或 JSON-LD 时使用：转义 <，防止数据里出现 </script> 提前结束脚本 */
export const jsonForScript = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c');
