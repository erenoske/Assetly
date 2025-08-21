// app/api/get-id-trade/route.js
import { cookies } from 'next/headers';
import config from '../../config/config'

export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const sid = cookieStore.get('sid')?.value;
    const { id } = await req.json();
    console.log(id);

    if (!sid) {
      return new Response(JSON.stringify({ error: 'Unauthorized: No session' }), {
        status: 401,
      });
    }

    const backendRes = await fetch(`${config.apiBaseUrl}/api/trades`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `sid=${sid}`,
      },
    });


    const contentType = backendRes.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      const text = await backendRes.text();
      console.error("Non-JSON backend response:", text);
      return new Response(JSON.stringify({ error: 'Invalid backend response' }), {
        status: 500,
      });
    }

    const result = await backendRes.json();

    return new Response(JSON.stringify(result), {
      status: backendRes.status,
    });

  } catch (error) {
    console.error('Server fetch error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
    });
  }
}