export const initialStore=()=>{
  return{
    message: null,
     auth: localStorage.getItem('token')? true : false,
     profile:JSON.parse(localStorage.getItem("profile")) || {} ,
    todos: [
      {
        id: 1,
        title: "Make the bed",
        background: null,
      },
      {
        id: 2,
        title: "Do my homework",
        background: null,
      }
    ]
  }
}

export default function storeReducer(store, action = {}) {
  switch(action.type){
    case "set_user":
  return {
    ...store,
    profile: action.payload,
    auth: true, 
  };


     case "save_user":
      return{
        ...store,
        user:action.payload
      };

      case "update_user_profile":
      return {
        ...store,
        profile: { ...store.profile, ...action.payload }, 
      };

    
    case "user_logged_out":
      localStorage.removeItem("token")
      localStorage.removeItem("profile")
      return{
        ...store,
        auth:false,
        user: {
      id: null,
      email: "",
      username: "",
      avatar: "",
      preference: ""
    },
      };
    case "user_logged_in":
      return{
        ...store,
        auth:true
      };
    case 'set_hello':
      return {
        ...store,
        message: action.payload
      };
      
    case 'add_task':

      const { id,  color } = action.payload

      return {
        ...store,
        todos: store.todos.map((todo) => (todo.id === id ? { ...todo, background: color } : todo))
      };
    default:
      throw Error('Unknown action.');
  }    
}
