'use server'


import { getCookies } from "./sever-cookie"




type TypedResponse = {
   status: boolean
   message?: string
   /* eslint-disable @typescript-eslint/no-explicit-any */
   data?: any
}


const APP_KEY = process.env.NEXT_PUBLIC_APP_KEY || `APP_KEY_NOT_FOUND`


export const get = async (url: string, credential: string): Promise<TypedResponse> => {
   try {
       const token = credential ? await getCookies(credential) : ``
       const res = await fetch(url, {
           method: "GET",
           headers: {
               "APP-KEY": APP_KEY,
               "Authorization": `Bearer ${token}`,


           },
           cache: "no-store",
           credentials: 'include'
       })


       if (!res.ok) {
           console.log(res);
           return {
               status: false,
               message: `GET REQUEST FAILED`,
               data: null
           }
       }
       const data = await res.json()
       return {
           status: true,
           data
       }
   } catch (error) {
       console.log(error);
       return {
           status: false,
           message: `there are an errors. ${error}`,
           data: null
       }
   }
}


export const drop = async (url: string, credential: string): Promise<TypedResponse> => {
   try {
       const token = credential ? await getCookies(credential) : ``
       const res = await fetch(url, {
           method: "DELETE",
           headers: {
               "APP-KEY": APP_KEY,
               "Authorization": `Bearer ${token}`,
           },
           credentials: 'include'
       })


       if (!res.ok) {
           console.log(res);
           return {
               status: false,
               message: `DELETE REQUEST FAILED`,
               data: null
           }
       }
       const data = await res.json()
       return {
           status: true,
           data
       }
   } catch (error) {
       console.log(error);
       return {
           status: false,
           message: `there are an errors. ${error}`,
           data: null
       }
   }
}


export const post = async (url: string, payload: string | FormData, credential?: string): Promise<TypedResponse> => {
   // console.log('payload');
   try {
       const token = credential ? await getCookies(credential) : ``
       const headers: HeadersInit | undefined = {
           "APP-KEY": APP_KEY,
           "Authorization": `Bearer ${token}`,
       }
       if (typeof payload == "string") headers[`Content-Type`] = "application/json"
       console.log({ payload });




       const res = await fetch(url, {
           method: "POST",
           headers,
           body: payload,
           credentials: 'include'
       })




       if (!res.ok) {
           // console.log('res not ok');
           console.log(res);
           return {
               status: false,
               message: `POST REQUEST FAILED`,
               data: null
           }
       }
       const data = await res.json()
       return {
           status: true,
           data
       }
   } catch (error) {
       console.log(error);
       return {
           status: false,
           message: `there are an errors. ${error}`,
           data: null
       }
   }
}


export const put = async (url: string, payload: string | FormData, credential?: string): Promise<TypedResponse> => {
   try {
       const token = credential ? await getCookies(credential) : ``
       const headers: HeadersInit | undefined = {
           "APP-KEY": APP_KEY,
           "Authorization": `Bearer ${token}`,
       }
       if (typeof payload == "string") headers[`Content-Type`] = "application/json"
       const res = await fetch(url, {
           method: "PUT",
           headers,
           body: payload,
           credentials: 'include'
       })


       if (!res.ok) {
           console.log(res);
           return {
               status: false,
               message: `PUT REQUEST FAILED`,
               data: null
           }
       }
       const data = await res.json()
       return {
           status: true,
           data
       }
   } catch (error) {
       console.log(error);
       return {
           status: false,
           message: `there are an errors. ${error}`,
           data: null
       }
   }
}


export const patch = async (url: string, payload: string | FormData, credential?: string): Promise<TypedResponse> => {
   try {
       const token = credential ? await getCookies(credential) : ``
       const headers: HeadersInit | undefined = {
           "APP-KEY": APP_KEY,
           "Authorization": `Bearer ${token}`,
       }
       if (typeof payload == "string") headers[`Content-Type`] = "application/json"
       const res = await fetch(url, {
           method: "PATCH",
           headers,
           body: payload,
           credentials: 'include'
       })


       if (!res.ok) {
           console.log(res);
           return {
               status: false,
               message: `PATCH REQUEST FAILED`,
               data: null
           }
       }
       const data = await res.json()
       return {
           status: true,
           data
       }
   } catch (error) {
       console.log(error);
       return {
           status: false,
           message: `there are an errors. ${error}`,
           data: null
       }
   }
}
