interface Env {YOUTUBE_API_KEY?:string}
interface Context {request:Request;env:Env}
export async function onRequestGet({request,env}:Context){
 const url=new URL(request.url),q=(url.searchParams.get('q')||'').trim(),language=url.searchParams.get('language')||'';
 const headers={'Content-Type':'application/json','Cache-Control':'no-store'};
 if(!q||q.length>150)return Response.json({error:'Enter a search of 1–150 characters.'},{status:400,headers});
 if(!env.YOUTUBE_API_KEY)return Response.json({error:'Song search is waiting for YouTube API setup. You can play a YouTube link below now.',setupRequired:true},{status:503,headers});
 const params=new URLSearchParams({part:'snippet',type:'video',videoEmbeddable:'true',videoSyndicated:'true',maxResults:'12',safeSearch:'moderate',q:`${q} ${language} music`,key:env.YOUTUBE_API_KEY});
 try{
  const response=await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);const data=await response.json() as {items?:Array<{id:{videoId:string};snippet:{title:string;channelTitle:string;thumbnails:{medium?:{url:string}}}}>};
  if(!response.ok)return Response.json({error:response.status===403?'YouTube search is unavailable. The API key or daily quota needs attention.':'YouTube search is temporarily unavailable. Try again later.'},{status:502,headers});
  return Response.json({items:(data.items||[]).map(v=>({id:v.id.videoId,title:v.snippet.title,channel:v.snippet.channelTitle,thumbnail:v.snippet.thumbnails.medium?.url}))},{headers});
 }catch{return Response.json({error:'Unable to reach YouTube. Please try again.'},{status:502,headers})}
}
