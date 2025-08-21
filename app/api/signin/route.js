import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import config from '../../config/config'

export async function POST(req) {
  const { username, password } = await req.json()

  try {
    const backendResponse = await fetch(`${config.apiBaseUrl}/api/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      credentials: 'include'
    })

    if (!backendResponse.ok) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const data = await backendResponse.json()
    const token = data.key

    if (!token) {
      return NextResponse.json({ error: 'No token returned' }, { status: 500 })
    }

    const cookieStore = await cookies();

    cookieStore.set({
      name: 'sid',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
