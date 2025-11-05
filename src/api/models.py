from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, Text, ForeignKey, Float, Date, DateTime, Enum, JSON,Integer
from sqlalchemy.orm import Mapped, mapped_column,relationship
from datetime import datetime, date


db = SQLAlchemy()

class User(db.Model):
    __tablename__="user"
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow)
    valoration:Mapped[int]=mapped_column(Integer,default=0)
    profile: Mapped["Profile"] = relationship(back_populates="user",uselist=False,cascade="all, delete-orphan")
    favorites:Mapped[list["Favorites"]]=relationship(back_populates="user",uselist=True,cascade="all, delete-orphan")
    movie_view:Mapped[list["MoviesViews"]] = relationship(back_populates="user",uselist=True,cascade="all, delete-orphan")
    reviews:Mapped[list["Reviews"]]=relationship(back_populates="user",uselist=True,cascade="all, delete-orphan")
    reviews_movie_verse:Mapped[list["ReviewsMovieVerse"]] = relationship(back_populates="user",uselist=True, cascade="all, delete-orphan")


    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "valoration":self.valoration,
            "profile": self.profile.serialize() if self.profile else None,
            "favorites":[f.serialize() for f in self.favorites] if self.favorites else None,
            "movie_view":[m.serialize() for m in self.movie_view] if self.movie_view else None,
            "reviews":[r.serialize() for r in self.reviews] if self.reviews else None,
            "reviews_movie_verse":[rm.serialize() for rm in self.reviews_movie_verse] if self.reviews_movie_verse else None
            
        }
    
class Profile(db.Model):
    __tablename__="profile"
    id: Mapped[int] = mapped_column(primary_key=True)
    username:Mapped[str] = mapped_column(String(120), nullable = True)
    avatar:Mapped[str] = mapped_column(String(500), nullable = True)
    preference: Mapped[str] = mapped_column(String(500), nullable = True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"))
    user:Mapped["User"] = relationship(back_populates="profile",uselist=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow)
    
    def serialize(self):
        return{
            "id":self.id,
            "username": self.username,
            "avatar":self.avatar,
            "preference":self.preference,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "user":{
                "id":self.user.id,
                "email":self.user.email
            }
        }
    


    
class Favorites(db.Model):
    __tablename__="favorites"
    id:Mapped[int]=mapped_column(primary_key=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow)
    user_id:Mapped[int]= mapped_column(ForeignKey("user.id"))
    user:Mapped["User"] = relationship(back_populates="favorites")
    tmdb_id:Mapped[int]=mapped_column(Integer)
    

    def serialize(self):
        return{
            "id":self.id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "tmdb_id": self.tmdb_id if self.tmdb_id else None,
            "user":{
                "id":self.user.id,
                "email":self.user.email
            }
            
        }
 
class MoviesViews(db.Model):
    __tablename__="movies_views"
    id:Mapped[int]= mapped_column(primary_key=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow)
    user_id:Mapped[int]= mapped_column(ForeignKey("user.id"))
    user:Mapped["User"] = relationship(back_populates="movie_view")
    tmdb_id:Mapped[int]=mapped_column(Integer)
    

    def serialize(self):
        return{
            "id":self.id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "tmdb_id": self.tmdb_id if self.tmdb_id else None,
            "user":{
                "id":self.user.id,
                "email":self.user.email
            }
           
        }


class Reviews(db.Model):
    __tablename__="reviews"
    id:Mapped[int]=mapped_column(primary_key=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow)
    title:Mapped[str]=mapped_column(String(250),nullable=False)
    body:Mapped[str]=mapped_column(Text())
    valoration:Mapped[int]= mapped_column(Integer,default=0)
    user_id:Mapped[int]=mapped_column(ForeignKey("user.id"))
    tmdb_id:Mapped[int]= mapped_column(Integer)
    user:Mapped["User"] = relationship(back_populates="reviews")
    

    def serialize(self):
        return{
            "id": self.id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "title":self.title,
            "body":self.body,
            "valoration":self.valoration,
            "tmdb_id": self.tmdb_id if self.tmdb_id else None,
            "user":{
                "id":self.user.id,
                "email":self.user.email
            }
            

        }
    
class ReviewsMovieVerse(db.Model):
    __tablename__="reviews_movie_verse"
    id:Mapped[int]=mapped_column(primary_key=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow)
    title:Mapped[str]=mapped_column(String(200),nullable=False)
    body:Mapped[str]=mapped_column(Text(),nullable=False)
    valoration:Mapped[int]=mapped_column(Integer,default=0)
    user_id:Mapped[int]=mapped_column(ForeignKey("user.id"))
    user:Mapped["User"] = relationship(back_populates="reviews_movie_verse")

    def serialize(self):
        return{
            "id":self.id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "title":self.title,
            "body":self.body,
            "valoration":self.valoration,
            "user":{
                "id":self.user.id,
                "email":self.user.email
            }
            
        }

    
     
    
    
    