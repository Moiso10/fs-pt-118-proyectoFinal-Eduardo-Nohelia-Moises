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



userServices.deleteAccount = async (id) => {
  try {
    
    const res = await fetch(url + "/api/user/" + id, {
      method: "DELETE",
      headers: { Authorization: "Bearer" + localStorage.getItem("token") },
    });

    if (!res.ok) throw new Error("Error delete account");
    return await res.json();
  } catch (error) {
    console.error(error);
  }
};

















































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