import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  // လက်ရှိ Deploy ဖြစ်နေတဲ့ Timestamp ကို ယူမယ်။ 
  // Vercel မှာ Code အသစ်တင်တိုင်း ဒီ Timestamp က အလိုအလျောက် ပြောင်းသွားပါမယ်။
  const buildId = process.env.VERCEL_DEPLOYMENT_ID || Date.now().toString();
  
  return NextResponse.json({ buildId });
}
