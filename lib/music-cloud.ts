'use client';
import {createClient, type User} from '@supabase/supabase-js';
import {useEffect,useRef,useState,type SetStateAction} from 'react';
import {supabaseUrl,supabasePublishableKey} from './supabase-config';
export type Playlist={id:string;name:string;tracks:number[]};
type Library={likes:number[];playlists:Playlist[]};
const empty=():Library=>({likes:[],playlists:[]});
export const supabase=createClient(supabaseUrl,supabasePublishableKey);
function sanitize(value:unknown):Library{
 const v=(value||{}) as Partial<Library>;
 return {likes:Array.isArray(v.likes)?[...new Set(v.likes.filter(x=>Number.isInteger(x)&&x>=0&&x<6))]:[],playlists:Array.isArray(v.playlists)?v.playlists.filter(p=>p&&typeof p.id==='string'&&typeof p.name==='string'&&Array.isArray(p.tracks)).map(p=>({id:p.id,name:p.name.slice(0,60),tracks:[...new Set(p.tracks.filter(x=>Number.isInteger(x)&&x>=0&&x<6))]})):[]};
}
function guestLibrary(){try{return sanitize(JSON.parse(localStorage.getItem('cadence-library')||'{}'))}catch{return empty()}}
export function useMusicCloud(){
 const [user,setUser]=useState<User|null>(null),[library,setLibrary]=useState<Library>(empty),[status,setStatus]=useState('Loading library…'),[ready,setReady]=useState(false),[authReady,setAuthReady]=useState(false),[loadId,setLoadId]=useState(0),[syncTick,setSyncTick]=useState(0);
 const owner=useRef<string|null>(null),readyRef=useRef(false),revision=useRef(0),generation=useRef(0),dirty=useRef(false),saving=useRef(false),latest=useRef<Library>(empty()),lastSaved=useRef('');
 useEffect(()=>{const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{setUser(session?.user??null);setAuthReady(true)});return()=>subscription.unsubscribe()},[]);
 useEffect(()=>{
  if(!authReady)return;const gen=++generation.current;readyRef.current=false;dirty.current=false;owner.current=user?.id??null;
  queueMicrotask(()=>{setReady(false);setStatus('Loading library…');setLibrary(empty())});
  async function load(){if(!user){const data=guestLibrary();if(gen!==generation.current)return;latest.current=data;lastSaved.current=JSON.stringify(data);setLibrary(data);readyRef.current=true;setReady(true);setStatus('Saved on this browser');return}
   const {data,error}=await supabase.from('music_libraries').select('likes,playlists,revision').eq('user_id',user.id).maybeSingle();
   if(gen!==generation.current)return;if(error){setStatus('Could not load cloud library. Check your connection and reload.');return}
   const clean=sanitize(data);revision.current=data?.revision??0;latest.current=clean;lastSaved.current=JSON.stringify(clean);setLibrary(clean);readyRef.current=true;setReady(true);setStatus('Cloud library up to date');
  }void load();return()=>{generation.current++};
 },[user?.id,authReady,loadId]);
 function edit(key:keyof Library,value:SetStateAction<number[]>|SetStateAction<Playlist[]>){
  if(!readyRef.current)return;
  const prev=latest.current;const next={...prev,[key]:typeof value==='function'?(value as (v:Library[typeof key])=>Library[typeof key])(prev[key]):value};
  latest.current=next;dirty.current=true;setLibrary(next);setStatus(owner.current?'Saving to cloud…':'Saved on this browser');
 }
 useEffect(()=>{
  if(!ready||!dirty.current)return;
  if(!user){try{localStorage.setItem('cadence-library',JSON.stringify(library));dirty.current=false}catch{setStatus('Browser storage unavailable')}return}
  const gen=generation.current;
  const timer=setTimeout(async()=>{
   if(saving.current){setTimeout(()=>setSyncTick(v=>v+1),300);return}
   const snapshot=latest.current;if(JSON.stringify(snapshot)===lastSaved.current){dirty.current=false;setStatus('Cloud library up to date');return}
   saving.current=true;
   const {data,error}=await supabase.rpc('save_music_library',{expected_revision:revision.current,new_likes:snapshot.likes,new_playlists:snapshot.playlists});
   saving.current=false;
   if(gen!==generation.current)return;
   if(error){readyRef.current=false;setReady(false);setStatus(error.message.includes('another device')?'Changed on another device. Reload your cloud library.':'Cloud save failed. Your changes are still open here. Retry to save.');return}
   revision.current=data?.[0]?.revision??revision.current+1;lastSaved.current=JSON.stringify(snapshot);dirty.current=JSON.stringify(latest.current)!==lastSaved.current;setStatus(dirty.current?'Saving to cloud…':'Cloud library up to date');if(dirty.current)setSyncTick(v=>v+1);
  },500);return()=>clearTimeout(timer);
 },[library,ready,user?.id,syncTick]);

 function importGuest(){if(!user||!readyRef.current)return;const guest=guestLibrary();const prev=latest.current;const merged={likes:[...new Set([...prev.likes,...guest.likes])],playlists:[...prev.playlists,...guest.playlists.filter(p=>!prev.playlists.some(x=>x.id===`import-${p.id}`)).map(p=>({...p,id:`import-${p.id}`}))]};latest.current=merged;dirty.current=true;setLibrary(merged);setStatus('Saving to cloud…')}
 return {user,likes:library.likes,playlists:library.playlists,ready,status,setLikes:(v:SetStateAction<number[]>)=>edit('likes',v),setPlaylists:(v:SetStateAction<Playlist[]>)=>edit('playlists',v),reload:()=>setLoadId(v=>v+1),retry:()=>{readyRef.current=true;setReady(true);setLibrary({...latest.current})},importGuest};
}
