import { NextResponse } from 'next/server';
export async function POST(req:Request){const body=await req.json().catch(()=>({})); const action=body.action||'start'; const events=[
{id:'1',name:'Incident detected',desc:'Technician reported overheating and abnormal vibration on Machine 7.',time:'00:00',state:'done'},
{id:'2',name:'Asset identified',desc:'Machine 7 → Line 2 → Plant A. Incident #10482 opened.',time:'00:02',state:'done'},
{id:'3',name:'Telemetry checked',desc:'Temperature 18% above normal; vibration outside baseline.',time:'00:04',state:'done'},
{id:'4',name:'Maintenance history checked',desc:'Last bearing service was 17 days ago.',time:'00:05',state:'done'},
{id:'5',name:'SOP retrieved',desc:'Procedure recommends load reduction and bearing inspection.',time:'00:06',state:'done'},
{id:'6',name:'Inventory exception',desc:'Required bearing is unavailable at Plant A.',time:'00:07',state:'exception'},
{id:'7',name:'Recovery plan found',desc:'Compatible bearing available at Warehouse B, 14 km away.',time:'00:08',state:'done'},
];
if(action==='approve') events.push({id:'8',name:'Authorized & dispatched',desc:'Supervisor approval recorded. Bearing dispatch and technician assignment initiated.',time:'00:09',state:'done'} as any);
if(action==='verify') events.push({id:'9',name:'Resolution verified',desc:'Temperature and vibration returned to normal operating range.',time:'00:14',state:'done'} as any);
return NextResponse.json({incident:'10482',events,status:action==='verify'?'RESOLVED':action==='approve'?'EXECUTING':'AUTHORIZATION_REQUIRED'});}
