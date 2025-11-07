const userServices = {}
const url = import.meta.env.VITE_BACKEND_URL

userServices.register = async(formData) =>{

    try {

        const resp = await fetch(url+"/api/register",{

            method: "POST",
            headers:{
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        if(!resp.ok) throw new Error("Error Registering")
        
        const data = await resp.json()

        return data
        
    } catch (error) {
        console.log(error)
        
    }

}


userServices.login = async(formData) =>{

    try {

        const resp = await fetch(url+"/api/login",{

            method: "POST",
            headers:{
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        if(!resp.ok) throw new Error("Error Login")
        
        const data = await resp.json()

        return data
        
    } catch (error) {
        console.log("error",error)
        
    }

}

userServices.getProfile = async () => {
  try {
    const resp = await fetch(url +"/api/profile" , {
      method: "GET",
      headers: { "Content-Type": "application/json" , "Authorization": "Bearer " + localStorage.getItem('token')
       },
    });

    if (!resp.ok) throw new Error("Error fetching profile");
    const data = await resp.json();

    return data;

  } catch (error) {
    console.error("Error:", error);
  }
};


userServices.updateProfile = async (formData) => {
    try {
        const resp = await fetch(url + '/api/profile', {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token') 
            },
            body: JSON.stringify(formData)
        })
        if (!resp.ok) throw new Error('error updating profile')
        const data = await resp.json()
        return data
    } catch (error) {
        console.log(error)
    }
}



userServices.deleteAccount = async () => {
  try {
    
    const res = await fetch(url + "/api/user" , {
      method: "DELETE",
      headers: { "Authorization": "Bearer " + localStorage.getItem("token") },
    });

    if (!res.ok) throw new Error("Error delete account");
    return true
  } catch (error) {
    console.error(error);
  }
};




userServices.checkMail = async(email) =>{

    try {

        const resp = await fetch(url+"/api/check_mail",{

            method: "POST",
            headers:{
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        })
        if(!resp.ok) throw new Error("Error check mail")
        
        const data = await resp.json()

        return data
        
    } catch (error) {
        console.log("error",error)
        
    }

}


userServices.updatePassword = async(newPassword , token) =>{
  try {
    const resp = await fetch(url + "/api/password_update",{
      method: "PUT",
      headers:{
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token,
      },
      body: JSON.stringify({password: newPassword})
    })
    if(!resp.ok) throw new Error("Error actualizando contraseña")

    const data = await resp.json()

    return data 

  
  } catch (error) {
    console.log("Error", error)
  }
  
  
}












































export default userServices
 
// MovieVerse reviews services
userServices.createMovieVerseReview = async (formData) => {
  try {
    const resp = await fetch(url + "/api/movieverse", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify(formData),
    });
    if (!resp.ok) throw new Error("Error creating MovieVerse review");
    const data = await resp.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
  }
};