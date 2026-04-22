// Cloudflare Workers 入口文件
// 将环境变量注入到 HTML 中

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // 处理静态文件请求
    if (url.pathname === '/' || url.pathname === '/index.html') {
      // 从环境变量获取配置
      const supabaseUrl = env.SUPABASE_URL;
      const supabaseAnonKey = env.SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        return new Response('环境变量未配置：SUPABASE_URL 和 SUPABASE_ANON_KEY', { 
          status: 500,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      }
      
      // 读取 index.html 并注入环境变量
      const html = await env.ASSETS.fetch(request);
      let text = await html.text();
      
      // 替换占位符为实际值
      text = text.replace(/"{{ SUPABASE_URL }}"/g, `"${supabaseUrl}"`);
      text = text.replace(/"{{ SUPABASE_ANON_KEY }}"/g, `"${supabaseAnonKey}"`);
      
      return new Response(text, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }
    
    // 其他静态文件直接返回
    return env.ASSETS.fetch(request);
  }
};
