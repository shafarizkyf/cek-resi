import { NextResponse } from 'next/server'

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3001'

export async function GET() {
  try {
    const response = await fetch(`${SERVER_URL}/api/couriers`)
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch couriers' }, { status: 500 })
  }
}
