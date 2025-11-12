"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from .models import db, User,Profile,MoviesViews,Favorites,Reviews,ReviewsMovieVerse
from flask_cors import CORS
from sqlalchemy import select
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
import cloudinary
import cloudinary.uploader
from flask_mail import Message
from .mail.mailer import send_email


api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)


@api.route('/mailer/<address>', methods=['POST'])
def handle_mail(address):
   return send_email(address)


@api.route('/token', methods=['GET'])
@jwt_required()
def check_jwt():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if user:
        return jsonify({'success': True, 'user': user.serialize()}), 200
    return jsonify({'success': False, 'msg': 'Bad token'}), 401


@api.route('/protected', methods=['GET'])
@jwt_required()
def handle_protected():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)   
    if user: 
        print(user.serialize()) 
        return  jsonify({'success': True, 'msg': 'Has logrado acceder a una ruta protegida '})
    return jsonify({'success': False, 'msg': 'Bad token'})


#funcion para verificar que el correo esta en la base de datos y enviar el correo de recuperacion de estarlo
@api.route("/check_mail", methods=['POST'])
def check_mail():
    try:
        data = request.json
        #buscamos el correo en la base de datos y almacenamos el resultado en la variable user
        user = User.query.filter_by(email=data['email']).first()
        #si no se encuentra, se devuelve que el correo no se ha encontrado
        if not user:
            return jsonify({'success': False, 'msg': 'email not found'}),404
        #creamos el token que se va a enviar y necesario para la recuperacion de la contraseña 
        token = create_access_token(identity=str(user.id))
        result = send_email(data['email'], token)
        print(result)
        return jsonify({'success': True, 'token': token, 'email': data['email']}), 200
    except Exception as e:
        print('error: '+ str(e))
        return jsonify({'success': False, 'msg': 'something went wrong'}),500


#ruta para actualizar el password. Se consume desde la vista para hacer el reset en el front
@api.route('/password_update', methods=['PUT'])
@jwt_required()
def password_update():
    try:
        data = request.json
        #extraemos el id del token que creamos en la linea 98
        id = get_jwt_identity()
        #buscamos usuario por id
        user = db.session.get(User,id)
        hashed_password= generate_password_hash(data["password"])
        #actualizamos password del usuario
        user.password = hashed_password
        #alacenamos los cambios
        db.session.commit()
        return jsonify({'success': True, 'msg': 'Contraseña actualizada exitosamente, intente iniciar sesion'}), 200
    except Exception as e:
        db.session.rollback()
        print (f"Error al enviar el correo: {str(e)}")
        return jsonify({'success': False, 'msg': f"Error al enviar el correo: {str(e)}"})






@api.route("/upload", methods=["POST"])
@jwt_required()
def upload_image():
    id = get_jwt_identity()
    # Check if a file part is present in the request
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    try:
        #upload to cloudinary
        #upload_result = cloudinary.uploader.upload(file)
        upload_result = cloudinary.uploader.upload(
            file,
            folder="user_avatars"  # carpeta opcional para organizar imágenes
        )
        if(upload_result["secure_url"]):
            query=select(Profile).where(Profile.user_id == id)
            user = db.session.execute(query).scalar_one()

            user.avatar = upload_result["secure_url"]
            db.session.commit()

    

        #return the url of the uploaded image to be used in the frontend and/or stored in the database
        return jsonify({
            "url": upload_result["secure_url"],
            "public_id": upload_result["public_id"]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

#------EndPoints User----------------------------------------

@api.route('/register',methods=['POST'])
def register():
    try:
        body= request.json

        if not body['password']:
            return jsonify({"error":"password is requiered"})
        
        raw_password = body["password"]
        
        hashed_password= generate_password_hash(raw_password)

        new_user = User(
            email = body['email'],
            password = hashed_password
        )
        db.session.add(new_user)
        db.session.flush()
       

        new_profile = Profile(
            username = body['email'],
            user_id = new_user.id
            
        )

        db.session.add(new_profile)
        db.session.commit()
        token = create_access_token(identity=str(new_user.id))

        return jsonify({'success': True, 'data': new_user.serialize(),"profile": new_profile.serialize(),"token":token}),200
    
    except Exception as error:
        return jsonify({'success': False , 'error': str(error)}),500
    

#-------------------endpoint login user---------------------------------------------------
@api.route('/login',methods=['POST'])
def login():
    try:
        body= request.json
        query=select(User).where(User.email == body["email"])
        user = db.session.execute(query).scalar_one()


        if not user:
            return jsonify({'success': False, 'user': 'no user found'}),404
        
        if not body['password']:
            return jsonify({"error":"password is requiered"})
        
        raw_password = body["password"]
        if not check_password_hash(user.password , raw_password):
            return jsonify({"error": "invalid password"})
        
        token = create_access_token(identity=str(user.id))

        
        return jsonify({'success': True, 'data': user.serialize(),"token": token}),200
    
    except Exception as error:
        return jsonify({'success': False , 'error': error}),500



#----------------------endpoint traer todos los usuarios-------------------------------------------


@api.route('/user', methods=['GET'])
def get_all_user():
    try:
        query= select(User)
        user = db.session.execute(query).scalars().all()

        if not user:
            return jsonify({'success':False, 'user':'No users'}),200
        user = [u.serialize() for u in user]

        return jsonify({'success': True, 'user':user}),200
    
    except Exception as error:
        return jsonify({'success': False, 'error':error}),500
    

#-----------endpoint obtener usuario por id-----------------

@api.route('/user/<int:id>', methods=['GET'])
def get_one_user(id):
    try:

        user = db.session.get(User,id)

        if not user:
            return jsonify({'success':False, 'user': 'No user found'}),200
        
        return jsonify({'success':True , 'user': user.serialize()}),200
    
    except Exception as error:
        return jsonify({'success': False, 'error':error}),500
        


#-------endpoint eliminar usuario----------------------------

@api.route('/user',methods=['DELETE'])
@jwt_required()
def delete_user():
    try:

        id = get_jwt_identity()
        user = db.session.get(User,id)

        if not user:
            return jsonify({'success': False, 'user':'No user'}),200
        
        db.session.delete(user)
        db.session.commit()

        return jsonify({"msg": 'user delete'}),200
    
    except Exception as error:
        return jsonify({'success':False, 'error':str(error)}),500
    

#----------------endpoints profile--------------------------------------

@api.route('/profile', methods=['GET'])
def get_all_profile():
    try:
        query=select(Profile)
        profile = db.session.execute(query).scalars().all()

        if not profile:
            return jsonify({'success': False, 'profile': 'no profiles'}),200
        
        profile = [p.serialize() for p in profile]
        return jsonify({'success': True, 'profile':profile}),200
    
    except Exception as error:
        return jsonify({'success': False, 'error':error}),500
    
#------------------endpoint obtener perfil por username-----------------------

@api.route('/profile/<username>', methods=['GET'])
def get_one_profile_by_name(username):
    try:
        query= select(Profile).where(Profile.username == username)
        profile = db.session.execute(query).scalars().all()
        profile = [p.serialize() for p in profile]

        if not profile:
            return jsonify({'success': False, 'profile':'No profile found'}),200
        
        return jsonify({'success': True, 'profile':profile}),200
    
    except Exception as error:
        return jsonify({'success': False, 'error': error}),500
    

#-----------------endpoint obtener perfil por id------------------------------

@api.route('/profile', methods=['GET'])
@jwt_required()
def get_own_profile():
    
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user:
            return jsonify({'success': False, 'message': 'Usuario no encontrado'}), 404

        return jsonify({
            'success': True,
            'user': user.serialize()
        }), 200

    except Exception as error:
        return jsonify({'success': False, 'error': str(error)}), 500
    


#------------endpoint modificar perfil----------------------------------------

@api.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        body = request.json
        id = get_jwt_identity()

        query=select(Profile).where(Profile.user_id == id)
        profile = db.session.execute(query).scalar_one()
        if not profile:
            return jsonify({'success':False, 'profile':'profile not Found'})
        
        profile.username = body.get('username') or profile.username
        profile.avatar = body.get('avatar') or profile.avatar
        profile.preference = body.get('preference') or profile.preference
        

     
        db.session.commit()
    
        return jsonify({'success': True, 'profile':profile.serialize()}),200
    except Exception as error:
        db.session.rollback()
        return jsonify({'success': False, 'error':error})
    
    


#----------------endpoints favorites------------------------------------------------------------



@api.route('/favorites', methods=['GET'])
def get_all_favorites():
    try:
        query=select(Favorites)
        favorites = db.session.execute(query).scalars().all()

        if not favorites:
            return jsonify({'success': False, 'favorites': 'no favorites'}),200
        
        favorites = [f.serialize() for f in favorites]
        return jsonify({'success': True, 'favorites':favorites}),200
    
    except Exception as error:
        return jsonify({'success': False, 'error':error}),500
    

#----------------endpoint obtener favoritos por id------------------------------------------

@api.route('/favorites/<int:id>', methods=['GET'])
def get_one_favorites(id):
    try:
       
        favorites= db.session.get(Favorites,id)

        if not favorites:
            return jsonify({'success':False, 'data':'No favorites found'}),200

        return jsonify({'success': True, 'data':favorites.serialize()}),200
    except Exception as error:
        return jsonify({'success': False, 'error':error}),500
    

#-----------------endpoint crear un favorito-----------------------------------------------

@api.route('/favorites', methods=['POST'])
@jwt_required()
def create_favorites():
    try:
        body = request.json
        id = get_jwt_identity()

    
        new_favorites= Favorites(
            user_id= id,
            tmdb_id=body['tmdb_id'],
        )
        db.session.add(new_favorites)
        db.session.commit()
    
        return jsonify({'success': True, 'data':new_favorites.serialize()}),201
    except Exception as error:
        db.session.rollback()
        return jsonify({'success': False, 'error':error}),500
    


#---------------endpoint eliminar favorito----------------------------------------

@api.route('/favorites', methods=['DELETE'])
@jwt_required()
def delete_favorites():
    try:
        id = get_jwt_identity()
       
        favorites= db.session.get(Favorites,id)

        if not favorites:
            return jsonify({'success':False, 'favorites':'No favorites found'}),200
        
        db.session.delete(favorites)
        db.session.commit()

        return jsonify({'success': True, 'data':'favorites delete'}),200
    except Exception as error:
        return jsonify({'success': False, 'error':error})
    
#---- eliminar un favorito por su id ----#  
# se elimina un favorito en base a su id
@api.route('/favorites/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_favorite(id):
    try:
   
        favorite= db.session.get(Favorites,id)

        if not favorite:
            return jsonify({'success':False, 'favorites':'No favorites found'}),200
        
        db.session.delete(favorite)
        db.session.commit()

        return jsonify({'success': True, 'data':'favorites delete'}),200
    except Exception as error:
        return jsonify({'success': False, 'error':error})


#---- favoritos por usuarios ----#
# busca los favoritos del usuario
@api.route('/favorites/user', methods=['GET'])
@jwt_required()
def get_user_favorites():
    try:
        user_id = get_jwt_identity()
        query = select(Favorites).filter_by(user_id=user_id)
        favorites = db.session.execute(query).scalars().all()

        if not favorites:
            return jsonify({'success': True, 'favorites': []}), 200

        # 🚀 devuelve lista simple de tmdb_id
        favorites_list = [f.serialize() for f in favorites]
        return jsonify({'success': True, 'favorites': favorites_list}), 200

    except Exception as error:
        return jsonify({'success': False, 'error': str(error)}), 500

#---- si la película esta en favorito del usuario ----#
# busca un favorito por el tmbd_id y el usuario
@api.route('/favorites/check/<int:tmdb_id>', methods=['GET'])
@jwt_required()
def check_favorite(tmdb_id):
    try:
        user_id = get_jwt_identity()
        favorite = db.session.query(Favorites).filter_by(user_id=user_id, tmdb_id=tmdb_id).first()

        if favorite:
            return jsonify({
                'success': True,
                'is_favorite': True,
                'favorite_id': favorite.id  # 👈 solo se accede si existe
            }), 200
        else:
            return jsonify({
                'success': True,
                'is_favorite': False,
                'favorite_id': None  # 👈 aquí evitamos el error
            }), 200

    except Exception as error:
        return jsonify({'success': False, 'error': str(error)}), 500


#----------------------endpoints reviews---------------------------------------------------------


#------endpoint para obtener todos las reseñas--------------------------------------
@api.route('/reviews', methods=['GET'])
def get_all_reviews():
    try:
        query=select(Reviews)
        reviews = db.session.execute(query).scalars().all()

        if not reviews:
            return jsonify({'success': False, 'reviews': 'no reviews'}),200
        
        reviews = [r.serialize() for r in reviews]
        return jsonify({'success': True, 'reviews':reviews}),200
    
    except Exception as error:
        return jsonify({'success': False, 'error':error}),500
    


#------------endpoints para obtener reseñas por peliculas----------------------

@api.route('/reviews/<int:tmdb_id>', methods=['GET'])
def get_movies_reviews(tmdb_id):
    try:
        query= select(Reviews).where(Reviews.tmdb_id == tmdb_id)
        reviews = db.session.execute(query).scalars().all()
        reviews = [r.serialize() for r in reviews]

        if not reviews:
            return jsonify({'success': False, 'reviews':'No reviews found'}),200
        
        return jsonify({'success': True, 'reviews':reviews}),200
    
    except Exception as error:
        return jsonify({'success': False, 'error': error}),500
    

#---------------endpoints para crear reseñas de peliculas---------------------------------

@api.route('/reviews', methods=['POST'])
@jwt_required()
def create_reviews():
    try:
        body = request.json
        id = get_jwt_identity()

    
        reviews= Reviews(
            title=body['title'],
            body=body['body'],
            valoration=body.get('valoration', 0),
            user_id= id,
            tmdb_id=body['tmdb_id']
            
        )
        db.session.add(reviews)
        db.session.commit()
    
        return jsonify({'success': True, 'reviews':reviews.serialize()}),201
    except Exception as error:
        db.session.rollback()
        return jsonify({'success': False, 'error':error}),500
    


#---------------endpoints para modificar reseñas de peliculas-------------------------------------

@api.route('/reviews', methods=['PUT'])
@jwt_required()
def update_reviews():
    try:
        body = request.json
        id = get_jwt_identity()

        reviews = db.session.get(Reviews,id)
        if not reviews:
            return jsonify({'success':False, 'reviews':'reviews not Found'})
        
        reviews.title = body.get('title') or reviews.title
        reviews.body = body.get('body') or reviews.body
        reviews.valoration = body.get('valoration') or reviews.valoration
        

     
        db.session.commit()
    
        return jsonify({'success': True, 'reviews':reviews.serialize()}),200
    except Exception as error:
        db.session.rollback()
        return jsonify({'success': False, 'error':error})
    
#---------------------endpoints para eliminar reseñas------------------------------------------------

@api.route('/reviews', methods=['DELETE'])
@jwt_required()
def delete_reviews():
    try:
        id = get_jwt_identity()
       
        reviews= db.session.get(Reviews,id)

        if not reviews:
            return jsonify({'success':False, 'reviews':'No reviews found'}),200
        
        db.session.delete(reviews)
        db.session.commit()

        return jsonify({'success': True, 'data':'reviews delete'}),200
    except Exception as error:
        return jsonify({'success': False, 'error':error})
    



#---------------------------------------------endpoints ReviewsMovieVerse------------------------------------------------------------
#-------------------endpoint para obtener estadisticas del usuario---------------------------

@api.route('/user/stats', methods=['GET'])
@jwt_required()
def get_user_stats():
    """
    Devuelve cuantas peliculas ha visto y cuantos favoritos tiene el usuario autenticado.
    
    """
    try:
        user_id = get_jwt_identity()

        # Cuenta cuantas peliculas ha marcado como vistas
        views_count = MoviesViews.query.filter_by(user_id=user_id).count()

        # Cuenta cuantas ha marcado como favoritas
        favorites_count = Favorites.query.filter_by(user_id=user_id).count()

        return jsonify({
            "success": True,
            "views_count": views_count,
            "favorites_count": favorites_count
        }), 200

    except Exception as error:
        return jsonify({
            "success": False,
            "error": str(error)
        }), 500


#----------------endpoints para obtener todas las reseñas de movieverse---------------------------------------

@api.route('/movieverse', methods=['GET'])
def get_all_reviews_movie_verse():
    try:
        query=select(ReviewsMovieVerse)
        reviews_movie_verse = db.session.execute(query).scalars().all()

        if not reviews_movie_verse:
            return jsonify({'success': False, 'reviews': 'no reviews'}),200
        
        reviews_movie_verse = [r.serialize() for r in reviews_movie_verse]
        return jsonify({'success': True, 'reviews_movie_verse':reviews_movie_verse}),200
    
    except Exception as error:
        return jsonify({'success': False, 'error':error}),500
    




#-------------------endpoints para crear reseñas movieverse---------------------------------------------


@api.route('/movieverse', methods=['POST'])
@jwt_required()
def create_reviews_movieverse():
    try:
        body = request.json
        id = get_jwt_identity()

    
        reviews_movie_verse= ReviewsMovieVerse(
            title=body['title'],
            body=body['body'],
            valoration=body['valoration'],
            user_id= id
        )
        db.session.add(reviews_movie_verse)
        db.session.commit()
    
        return jsonify({'success': True, 'reviews':reviews_movie_verse.serialize()}),201
    except Exception as error:
        db.session.rollback()
        return jsonify({'success': False, 'error':str(error)}),500
    


#--------------endpoint para modificar reseñas movieverse---------------------------------------------



@api.route('/movieverse', methods=['PUT'])
@jwt_required()
def update_reviews_movieverse():
    try:
        body = request.json
        id = get_jwt_identity()

        reviews_movie_verse = db.session.get(ReviewsMovieVerse,id)
        if not reviews_movie_verse:
            return jsonify({'success':False, 'reviews':'reviews not Found'})
        
        reviews_movie_verse.title = body.get('title') or reviews_movie_verse.title
        reviews_movie_verse.body = body.get('body') or reviews_movie_verse.body
        reviews_movie_verse.valoration = body.get('valoration') or reviews_movie_verse.valoration
        

     
        db.session.commit()
    
        return jsonify({'success': True, 'reviews_movie_verse':reviews_movie_verse.serialize()}),200
    except Exception as error:
        db.session.rollback()
        return jsonify({'success': False, 'error':error})
    


#----------------endpoint para eliminar reseñas movieverse---------------------------------------------


@api.route('/movieverse', methods=['DELETE'])
@jwt_required()
def delete_reviews_movieverse():
    try:
        id = get_jwt_identity()
       
        reviews_movie_verse= db.session.get(ReviewsMovieVerse,id)

        if not reviews_movie_verse:
            return jsonify({'success':False, 'reviews':'No reviews found'}),200
        
        db.session.delete(reviews_movie_verse)
        db.session.commit()

        return jsonify({'success': True, 'reviews':'reviews delete'}),200
    except Exception as error:
        return jsonify({'success': False, 'error':error})




#---------------------------endpoint peliculasvista casi se me olvidan xD -----------------------------

@api.route('/moviesviews', methods=['GET'])
def get_all_movieviews():
    try:
        query=select(MoviesViews)
        movies_views = db.session.execute(query).scalars().all()

        if not movies_views:
            return jsonify({'success': False, 'movies views': 'no movies views'}),200
        
        movies_views = [m.serialize() for m in movies_views]
        return jsonify({'success': True, 'movie views':movies_views}),200
    
    except Exception as error:
        return jsonify({'success': False, 'error':error}),500
    

#----------------endpoint para obtener peliculas vistas por id--------------------------------------

@api.route('/moviesviews/<int:id>', methods=['GET'])
def get_one_moviesviews(id):
    try:

        movies_views = db.session.get(MoviesViews,id)

        if not movies_views:
            return jsonify({'success':False, 'movies views': 'No movies views found'}),200
        
        return jsonify({'success':True , 'movies views': movies_views.serialize()}),200
    
    except Exception as error:
        return jsonify({'success': False, 'error':error}),500
    


#--------------------------endpoint para obtener peliculas vistas por titulo------------------------------


@api.route('/moviesviews/<title>', methods=['GET'])
def get_one_moviesviews_by_title(title):
    try:
        query= select(MoviesViews).where(MoviesViews.title == title)
        movies_views = db.session.execute(query).scalars().all()
        movies_views = [m.serialize() for m in movies_views]

        if not movies_views:
            return jsonify({'success': False, 'movies views':'No movies views found'}),200
        
        return jsonify({'success': True, 'movies views':movies_views}),200
    
    except Exception as error:
        return jsonify({'success': False, 'error': error}),500




#----------------endpoint para crear peliculas vistas------------------------------------------------------


@api.route('/moviesviews', methods=['POST'])
@jwt_required()
def create_moviesviews():
    try:
        body = request.json
        id = get_jwt_identity()

    
        movies_views= MoviesViews(
            user_id= id,
            tmdb_id=body['tmdb_id']
        )
        db.session.add(movies_views)
        db.session.commit()
    
        return jsonify({'success': True, 'movies views':movies_views.serialize()}),201
    except Exception as error:
        db.session.rollback()
        return jsonify({'success': False, 'error':error}),500




#------------------endpoint para eliminar peliculas vistas---------------------------------------


@api.route('/moviesviews', methods=['DELETE'])
@jwt_required()
def delete_moviesviews(id):
    try:
        id = get_jwt_identity()
       
        movies_views= db.session.get(MoviesViews,id)
        

        if not movies_views:
            return jsonify({'success':False, 'movies views':'No movies views found'}),200
        
        db.session.delete(movies_views)
        db.session.commit()

        return jsonify({'success': True, 'movie views':'movies views delete'}),200
    except Exception as error:
        return jsonify({'success': False, 'error':error})

#---- Peliculas vistas por usuarios ----#
# busca las peliculas que el usuario a marcado como vistas
@api.route('/moviesviews/user', methods=['GET'])
@jwt_required()
def get_user_moviesviews():
    try:
        user_id = get_jwt_identity()
        query = select(MoviesViews).filter_by(user_id=user_id)
        moviesviews = db.session.execute(query).scalars().all()

        if not moviesviews:
            return jsonify({'success': True, 'moviesviews': []}), 200

        moviesviews = [f.serialize() for f in moviesviews]
        return jsonify({'success': True, 'moviesviews': moviesviews}), 200

    except Exception as error:
        return jsonify({'success': False, 'error': str(error)}), 500
    

#---- Eliminar pelicula vista por usuario ----#
# Elimina la película vista en la tabla movie_views(MoviesViews), por id de movie_views
@api.route('/moviesviews/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_moviesview(id):
    try:

        movies_views= db.session.get(MoviesViews,id)
        
        if not movies_views:
            return jsonify({'success':False, 'movies views':'No movies views found'}),200
        
        db.session.delete(movies_views)
        db.session.commit()

        return jsonify({'success': True, 'movie views':'movies views delete'}),200
    except Exception as error:
        return jsonify({'success': False, 'error':error})
    

#---- Obtener los detalles de a película----#
""" 
Se buscan los detalles de la película
tanto si esta en favoritos o en peliculas vistas
"""
@api.route('/user/movie/<int:tmdb_id>', methods=['GET'])
@jwt_required()
def get_user_movie_status(tmdb_id):
    try:
        user_id = get_jwt_identity()

        # Buscar si esa película está en favoritos o vistas
        favorite = Favorites.query.filter_by(user_id=user_id, tmdb_id=tmdb_id).first()
        watched = MoviesViews.query.filter_by(user_id=user_id, tmdb_id=tmdb_id).first()

        return jsonify({
            "success": True,
            "favorite": {
                "id": favorite.id,
                "tmdb_id": favorite.tmdb_id
            } if favorite else None,
            "watched": {
                "id": watched.id,
                "tmdb_id": watched.tmdb_id
            } if watched else None
        }), 200

    except Exception as e:
        print("❌ Error al verificar película:", e)
        return jsonify({"success": False, "error": str(e)}), 500
