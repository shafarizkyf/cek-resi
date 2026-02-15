import { NextRequest, NextResponse } from 'next/server'

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3001'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const courier = searchParams.get('courier')
  const awb = searchParams.get('awb')

  if (!courier || !awb) {
    return NextResponse.json({ error: 'Missing courier or awb parameter' }, { status: 400 })
  }

  try {
    const response = await fetch(`${SERVER_URL}/api/track?courier=${courier}&awb=${awb}`)
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tracking data' }, { status: 500 })
  }
}
