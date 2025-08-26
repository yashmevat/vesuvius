// app/api/elaborate/route.js
import { NextResponse } from 'next/server';
import { getElaboratedText3 } from '@/lib/cohereai';

export async function POST(req) {
  try {
    const { shortText, clientName } = await req.json();
    if (!shortText) {
      return NextResponse.json({ error: 'Short text is required' }, { status: 400 });
    }

    const elaboratedText = await getElaboratedText3(shortText, clientName);
    return NextResponse.json({ elaboratedText });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
