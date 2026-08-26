create database store;
use store;

create table rol( id int auto_increment primary key,
 rol varchar(20) not null unique);
insert into rol (rol) values ('admin');
insert into rol (rol) values ('seller');
insert into rol (rol) values ('customer');

select * from rol;

create table users (id int auto_increment primary key,
		email varchar(100) not null unique,
        password varchar(200) not null,
        state tinyint(1) default 1,
        id_rol int not null,
        constraint fk_rol_user
        foreign key (id_rol) references rol(id)
        on delete restrict
        on update cascade
);

show tables;

create table customers(id int auto_increment primary key,
		id_user int not null unique,
        name varchar(150) not null,
        phone varchar(20),
        address text,
        constraint fk_user_customer
        foreign key (id_user) references users(id)
        on delete cascade
        on update cascade
);

create table stores (id int auto_increment primary key,
		id_user int not null unique,
        store_name varchar(100) not null,
        rfc varchar(20),
        logo_url varchar(255),
        constraint fk_user_store
        foreign key (id_user) references users(id)
        on delete cascade
        on update cascade
);