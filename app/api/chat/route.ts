import { NextRequest } from "next/server";


export async function POST(req:NextRequest){

  try {
    const body = await req.json();


    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {

        Authorization: `Bearer ${process.env.API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    return new Response(response.body, {
      status: response.status,
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
      }
    });

  } catch (e) {
    console.error(e);
    return new Response('Error', { status: 500 });
  }
}
