import mongoose from "mongoose";
import { app } from "../app";

import request, { Response } from "supertest";

import Blog from "../model/blog";
import Comment from "../model/comment";
import User from "../model/user";
import Like from "../model/like";
import Message from "../model/message";

import bcrypt from 'bcryptjs'
import jwt from "jsonwebtoken";

import "dotenv/config";
import path from "path";

const apiUrl = 'http://localhost:3000/'

const adminId = new mongoose.Types.ObjectId();
const userId = new mongoose.Types.ObjectId();
const userId2 = new mongoose.Types.ObjectId();

const blogId = new mongoose.Types.ObjectId();

const commentId = new mongoose.Types.ObjectId();

const messageId = new mongoose.Types.ObjectId();

const userToken = () => {
    return jwt.sign({
        email: "test@gmail.com",
        userId: userId.toString()
    },
        `${process.env.JWT_SECRET}`,
        { expiresIn: '1h' }
    );
}


describe('APITest', () => {
    beforeAll(async () => {
        await mongoose.disconnect()
        await mongoose.connect(process.env.MONGODB_TEST_CONNECTION_STRING!.toString())
    }, 60000)

    afterAll(async () => {
        await mongoose.disconnect();
    }, 60000)

    // Authentication Test
    describe('AuthenticationTest', () => {
        beforeAll(async () => {
            await User.create([
                {
                    _id: userId,
                    name: "usertest",
                    photo: "phototest",
                    dob: "dobtest",
                    email: "test@gmail.com",
                    password: 'testpassword'
                },
                {
                    _id: userId2,
                    name: "user2test",
                    photo: "phototest",
                    dob: "dobtest",
                    email: "test2@gmail.com",
                    password: 'testpassword'
                }]
            )
        })
        afterAll(async () => {
            await User.deleteMany();
        })

        describe('User signUp test', () => {
            it("should create new User", async () => {
                const res = await request(app)
                    .post('/api/auth/signup')
                    .field('name', 'username')
                    .field('dob', 'userdob')
                    .field('email', 'user@gmail.com')
                    .field('password', 'userpassword')
                    .attach('photo', `${__dirname}/test-file/photo.png`)

                expect(res.statusCode).toBe(201)
                expect(res.body.message).toBeDefined()
            })

            describe("Doesn't create new user", () => {
                test('if user email already exist', async () => {
                    const res = await request(app)
                        .post('/api/auth/signup')
                        .field('name', 'username')
                        .field('dob', 'userdob')
                        .field('email', 'user@gmail.com')
                        .field('password', 'userpassword')
                        .attach('photo', `${__dirname}/test-file/photo.png`)
                    expect(res.statusCode).toBe(400)
                })

                test('For unsupported image type.', async () => {
                    const res = await request(app)
                        .post('/api/auth/signup')
                        .field('name', 'username')
                        .field('dob', 'userdob')
                        .field('email', 'user@gmail.com')
                        .field('password', 'userpassword')
                        .attach('photo', `${__dirname}/test-file/photo.webp`)
                    expect(res.statusCode).toBe(415)
                })

                test('if there is data validation error', async () => {
                    const res = await request(app)
                        .post('/api/auth/signup')
                        .send({
                            name: 'u',
                            photo: 'userphoto',
                            dob: 'userdob',
                            email: 'user@gmail.com',
                            password: 'userpassword'
                        })
                    expect(res.statusCode).toBe(422)
                })
            })
        })

        describe('Login test', () => {
            it('should authenticate the user', async () => {
                const res = await request(app)
                    .post('/api/auth/login')
                    .send({
                        email: 'user@gmail.com',
                        password: 'userpassword'
                    })

                expect(res.statusCode).toBe(200);
                expect(res.body.token).toBeDefined();
            });

            describe('should not authenticate the user', () => {
                test("if user password is incorrect", async () => {
                    const res = await request(app)
                        .post('/api/auth/login')
                        .send({
                            email: 'user@gmail.com',
                            password: 'fakeuserpassword'
                        })

                    expect(res.statusCode).toBe(401);
                    expect(res.body.token).toBeUndefined();
                })
                test("if user email doesn't exist", async () => {
                    const res = await request(app)
                        .post('/api/auth/login')
                        .send({
                            email: 'fakeuser@gmail.com',
                            password: 'fakeuserpassword'
                        })

                    expect(res.statusCode).toBe(401);
                    expect(res.body.token).toBeUndefined();
                })
            })
        })


        describe('User information update test', () => {
            describe('If user is authenticated', () => {
                describe('Should update user data', () => {
                    test('If user uploaded new image', async () => {
                        const loggedUserToken = userToken();
                        const res = await request(app)
                            .put(`/api/auth/user/${userId}`)
                            .set('Authorization', `Bearer ${loggedUserToken}`)
                            .field('name', 'user-name-updated')
                            .field('dob', "dob-updated")
                            .attach('photo', `${__dirname}/test-file/photo.png`);

                        expect(res.statusCode).toBe(200);
                        expect(res.body.UpdatedUser).toBeDefined();
                    });
                    test("don't upload new image", async () => {
                        const loggedUserToken = userToken();
                        const res = await request(app)
                            .put(`/api/auth/user/${userId}`)
                            .set('Authorization', `Bearer ${loggedUserToken}`)
                            .send({
                                name: 'user-name-updated',
                                dob: "dob-updated",
                                photoUrl: `test-file/photo.png`
                            })

                        expect(res.statusCode).toBe(200);
                        expect(res.body.UpdatedUser).toBeDefined();
                    })
                })
                describe("Doesn't update user data", () => {

                    test('for incorrect syntax of _id submitted', async () => {
                        const loggedUserToken = userToken();
                        const fakeUserId = 'blog-123';
                        const res = await request(app)
                            .put(`/api/auth/user/${fakeUserId}`)
                            .set('Authorization', `Bearer ${loggedUserToken}`)
                            .field('name', 'user-name-updated')
                            .field('dob', "dob-updated")
                            .attach('photo', `${__dirname}/test-file/photo.png`);

                        expect(res.statusCode).toBe(400);
                        expect(res.body.UpdatedUser).toBeUndefined();
                    });

                    test("when encounters incorrect body data", async () => {
                        const loggedUserToken = userToken();

                        const res = await request(app)
                            .put(`/api/auth/user/${userId}`)
                            .set('Authorization', `Bearer ${loggedUserToken}`)
                            .field('name', '')
                            .field('dob', "dob-updated")
                            .attach('photo', `${__dirname}/test-file/photo.png`);

                        expect(res.statusCode).toBe(422);
                        expect(res.body.UpdatedUser).toBeUndefined();
                    })

                    test("when sent unsupported image type", async () => {
                        const loggedUserToken = userToken();

                        const res = await request(app)
                            .put(`/api/auth/user/${userId}`)
                            .set('Authorization', `Bearer ${loggedUserToken}`)
                            .field('name', 'updated-username')
                            .field('dob', "dob-updated")
                            .attach('photo', `${__dirname}/test-file/photo.webp`);

                        expect(res.statusCode).toBe(415);
                        expect(res.body.UpdatedUser).toBeUndefined();
                    })

                    test("if JWTtoken don't belong to that user", async () => {
                        const loggedUserToken = jwt.sign({
                            email: "fake@gmail.com",
                            userId: userId2.toString()
                        },
                            `${process.env.JWT_SECRET}`,
                            { expiresIn: '1h' }
                        );;
                        const fakeBlogId = blogId.toString().split('').reverse().join('');

                        const res = await request(app)
                            .put(`/api/auth/user/${fakeBlogId}`)
                            .set('Authorization', `Bearer ${loggedUserToken}`)
                            .field('name', 'user-name-updated')
                            .field('dob', "dob-updated")
                            .attach('photo', `${__dirname}/test-file/photo.png`);

                        expect(res.statusCode).toBe(401);
                        expect(res.body.UpdatedUser).toBeUndefined();
                    })
                })
            })
            describe('if user is not authenticated', () => {
                test('should not get any user', async () => {
                    const res = await request(app)
                        .put(`/api/auth/user/${userId}`);

                    expect(res.statusCode).toBe(401);
                    expect(res.body.users).toBeUndefined();
                })
            })
        })

        describe('get user information', () => {
            describe('LoggedUserDataTest', () => {
                let loggedUserToken: string;

                beforeAll(async () => {
                    loggedUserToken = userToken();
                })
                describe('If User is Authenticated', () => {
                    test('should return user info', async () => {
                        const res = await request(app)
                            .get(`/api/auth/user/${userId}/`)
                            .set('Authorization', `Bearer ${loggedUserToken}`)
                        expect(res.statusCode).toBe(200);
                        expect(res.body.user).toBeDefined();
                    })
                    describe("does not return user data", () => {
                        test('for incorrect syntax of _id', async () => {
                            const fakeUserId = 'blog-123';
                            const res = await request(app)
                                .get(`/api/auth/user/${fakeUserId}/`)
                                .set('Authorization', `Bearer ${loggedUserToken}`)

                            expect(res.statusCode).toBe(400);
                            expect(res.body.user).toBeUndefined();
                        });

                        test('for fake id', async () => {
                            const fakeUserId = new mongoose.Types.ObjectId();

                            const res = await request(app)
                                .get(`/api/auth/user/${fakeUserId.toString()}/`)
                                .set('Authorization', `Bearer ${loggedUserToken}`)

                            expect(res.statusCode).toBe(404);
                            expect(res.body.user).toBeUndefined();
                        });

                        test('for user who is not admin trying to get data for other users', async () => {
                            const res = await request(app)
                                .get(`/api/auth/user/${userId2.toString()}/`)
                                .set('Authorization', `Bearer ${loggedUserToken}`)

                            expect(res.statusCode).toBe(401);
                            expect(res.body.user).toBeUndefined();

                        });

                        test('for unregistered user', async () => {

                            const user = new mongoose.Types.ObjectId();

                            const sampleUserToken = jwt.sign({
                                email: "sampletest@gmail.com",
                                userId: user.toString()
                            },
                                `${process.env.JWT_SECRET}`,
                                { expiresIn: '1h' }
                            );

                            const res = await request(app)
                                .get(`/api/auth/user/${user}/`)
                                .set('Authorization', `Bearer ${sampleUserToken}`)

                            expect(res.statusCode).toBe(404);
                            expect(res.body.user).toBeUndefined();
                        });
                    })
                });
                describe('If user is not authenticated', () => {
                    test('does not return user data', async () => {
                        const res = await request(app)
                            .get(`/api/auth/user/${userId}`)
                            .set('Authorization', `Bearer dummy-token`)

                        expect(res.statusCode).toBe(401)
                        expect(res.body.user).toBeUndefined();
                    })
                })
            })
        })

        describe('Refresh access token test', () => {
            let refreshToken: string;
            beforeAll(async () => {
                refreshToken = jwt.sign({
                    email: "test@gmail.com",
                    userId: userId.toString()
                },
                    `${process.env.JWT_REFRESH_SECRET}`
                );
            })
            test('should return new access token', async () => {
                const res = await request(app)
                    .post(`/api/auth/token/${userId}`)
                    .send({
                        token: `${refreshToken}`
                    })

                expect(res.statusCode).toBe(200)
                expect(res.body.token).toBeDefined();
            })
            test("Doesn't return new access token, for non-existing user", async () => {
                const userId = new mongoose.Types.ObjectId()
                const res = await request(app)
                    .post(`/api/auth/token/${userId}`)
                    .send({
                        token: `${refreshToken}`
                    })

                expect(res.statusCode).toBe(401)
                expect(res.body.token).toBeUndefined();
            })
        })
    })

    // Dashboard Test
    describe('DasBoardTest', () => {
        let loggedAdminToken: string;

        beforeAll(async () => {
            loggedAdminToken = userToken();
            await Blog.create({
                _id: blogId,
                title: 'blog1',
                description: "xyz",
                imageUrl: 'xyz'
            });
            await User.create([
                {
                    _id: userId,
                    name: "admintest",
                    photo: "phototest",
                    dob: "dobtest",
                    email: "test@gmail.com",
                    password: 'testpassword',
                    isAdmin: true
                }, {
                    _id: userId2,
                    name: "user2test",
                    photo: "phototest2",
                    dob: "dobtest2",
                    email: "test2@gmail.com",
                    password: 'test2password'
                }]
            );
            await Message.create(
                {
                    _id: messageId,
                    email: 'message@gmail.com',
                    subject: 'thisissubject',
                    description: 'yourmessage'
                }
            )

        }, 10000)
        afterAll(async () => {
            await Blog.deleteMany();
            await User.deleteMany();
            await Like.deleteMany();
            await Comment.deleteMany();
            await Message.deleteMany();
        }, 10000)

        describe('BlogTest', () => {
            describe('Blog CRUD operation test', () => {
                describe('Get all blogs', () => {
                    describe('If user is Authenticated', () => {
                        test('should return all blogs', async () => {
                            const res = await request(app)
                                .get('/api/dashboard/blogs')
                                .set('Authorization', `Bearer ${loggedAdminToken}`);
                            expect(res.statusCode).toBe(200);
                            expect(res.body.blogs).toBeDefined();
                        })
                    })
                    describe('If user is not Authenticated as Admin', () => {
                        test('should not return any blog', async () => {
                            const res = await request(app)
                                .get('/api/dashboard/blogs');

                            expect(res.statusCode).toBe(401);
                            expect(res.body.blogs).toBeUndefined();
                        })
                    })
                    describe('If user is Authenticated but he/she is not Admin', () => {

                        test('should not return any blog', async () => {
                            const sampleUserToken = jwt.sign({
                                email: "test2@gmail.com",
                                userId: userId2.toString()
                            },
                                `${process.env.JWT_SECRET}`,
                                { expiresIn: '1h' }
                            );

                            const res = await request(app)
                                .get(`/api/dashboard/blogs`)
                                .set('Authorization', `Bearer ${sampleUserToken}`)

                            expect(res.statusCode).toBe(401);
                            expect(res.body.blogs).toBeUndefined();
                        })
                    })
                })
                describe('Get single blog', () => {
                    describe('If user is Authenticated', () => {
                        test('should return blog for specific id', async () => {
                            const res = await request(app)
                                .get(`/api/dashboard/blog/${blogId}`)
                                .set('Authorization', `Bearer ${loggedAdminToken}`);

                            expect(res.statusCode).toBe(200);
                            expect(res.body.blog).toBeDefined();
                        });
                        test('Doesn\'t return a blog, for incorrect syntax of _id', async () => {
                            const fakeBlogId = 'blog-123';
                            const res = await request(app)
                                .get(`/api/dashboard/blog/${fakeBlogId}`)
                                .set('Authorization', `Bearer ${loggedAdminToken}`);;

                            expect(res.statusCode).toBe(400);
                            expect(res.body.blog).toBeUndefined();
                        });
                        test('Doesn\'t return a blog, for fake id', async () => {
                            const fakeBlogId = blogId.toString().split('').reverse().join('');

                            const res = await request(app)
                                .get(`/api/dashboard/blog/${fakeBlogId}`)
                                .set('Authorization', `Bearer ${loggedAdminToken}`);

                            expect(res.statusCode).toBe(404);
                            expect(res.body.blog).toBeUndefined();
                        });
                    })
                    describe('If user is not Authenticated as Admin', () => {
                        test('should not return any blog', async () => {
                            const res = await request(app)
                                .get(`/api/dashboard/blog/${blogId}`)

                            expect(res.statusCode).toBe(401);
                            expect(res.body.blogs).toBeUndefined();
                        })
                    })
                })

                describe('Updating Blog', () => {
                    describe('if user is authenticated', () => {
                        test('should Update blog', async () => {
                            const res = await request(app)
                                .put(`/api/dashboard/blog/${blogId}`)
                                .set('Authorization', `Bearer ${loggedAdminToken}`)
                                .field('title', "Blog1")
                                .field('description', "blog description")
                                .attach('imageUrl', `${__dirname}/test-file/photo.png`)

                            expect(res.statusCode).toBe(200);
                            expect(res.body.blog).toBeDefined();

                        })
                        describe('Doesn\'t update a blog.', () => {
                            test('For incorrect syntax of _id', async () => {
                                const fakeBlogId = 'blog-123';
                                const res = await request(app)
                                    .put(`/api/dashboard/blog/${fakeBlogId}`)
                                    .set('Authorization', `Bearer ${loggedAdminToken}`);;

                                expect(res.statusCode).toBe(400);
                                expect(res.body.blog).toBeUndefined();
                            });
                            test('if submitted data belong to other blog', async () => {
                                const fakeBlogId = blogId.toString().split('').reverse().join('');

                                const res = await request(app)
                                    .put(`/api/dashboard/blog/${fakeBlogId}`)
                                    .set('Authorization', `Bearer ${loggedAdminToken}`)
                                    .send(
                                        {
                                            title: "Blog1",
                                            description: "blog description",
                                            newImageUrl: "blog picture"
                                        }
                                    );

                                expect(res.statusCode).toBe(409);
                                expect(res.body.blog).toBeUndefined();
                            });
                            test('For fake id', async () => {
                                const fakeBlogId = blogId.toString().split('').reverse().join('');

                                const res = await request(app)
                                    .put(`/api/dashboard/blog/${fakeBlogId}`)
                                    .set('Authorization', `Bearer ${loggedAdminToken}`)
                                    .send(
                                        {
                                            title: "Blog title updated",
                                            description: "blog desc",
                                            newImageUrl: "blog picture"
                                        }
                                    );

                                expect(res.statusCode).toBe(404);
                                expect(res.body.blog).toBeUndefined();
                            });
                            test('For validation error', async () => {

                                const res = await request(app)
                                    .put(`/api/dashboard/blog/${blogId}`)
                                    .set('Authorization', `Bearer ${loggedAdminToken}`)
                                    .send();

                                expect(res.statusCode).toBe(422);
                                expect(res.body.blog).toBeUndefined();
                            });
                            test('For unsupported file type', async () => {

                                const res = await request(app)
                                    .put(`/api/dashboard/blog/${blogId}`)
                                    .set('Authorization', `Bearer ${loggedAdminToken}`)
                                    .field('title', "Blog1")
                                    .field('description', "blog description")
                                    .attach('imageUrl', `${__dirname}/test-file/photo.webp`)

                                expect(res.statusCode).toBe(415);
                                expect(res.body.blog).toBeUndefined();
                            });
                        })
                    })
                    describe('if user is not authenticated', () => {
                        test('should not Update blog', async () => {
                            const res = await request(app)
                                .put('/api/dashboard/blog/${blogId}');

                            expect(res.statusCode).toBe(401);
                            expect(res.body.blogs).toBeUndefined();
                        })
                    })
                })

                describe('Creating New blog', () => {
                    describe('If user is authenticated', () => {
                        test('should create new blog', async () => {
                            const res = await request(app)
                                .post('/api/dashboard/blog')
                                .set("Authorization", `Bearer ${loggedAdminToken}`)
                                .field('title', "Blog2")
                                .field('description', "blog2 description")
                                .attach('imageUrl', `${__dirname}/test-file/photo.png`)

                            expect(res.statusCode).toBe(201)
                            expect(res.body.blog).toBeDefined()
                        });
                        describe('Doesn\'t create new blog', () => {
                            test('If there is data validation error', async () => {
                                const res = await request(app)
                                    .post('/api/dashboard/blog')
                                    .set("Authorization", `Bearer ${loggedAdminToken}`)
                                    .send({
                                        title: "Blo",
                                        description: "blog2 description",
                                        imageUrl: "blog2 picture"
                                    })

                                expect(res.statusCode).toBe(422)
                                expect(res.body.blog).toBeUndefined()
                            });
                            test('If provided data belong to other blog', async () => {
                                const res = await request(app)
                                    .post('/api/dashboard/blog')
                                    .set("Authorization", `Bearer ${loggedAdminToken}`)
                                    .field('title', "Blog2")
                                    .field('description', "blog2 description")
                                    .attach('imageUrl', `${__dirname}/test-file/photo.png`)

                                expect(res.statusCode).toBe(409)
                                expect(res.body.blog).toBeUndefined()
                            });
                            test('For unsupported file type', async () => {

                                const res = await request(app)
                                    .post(`/api/dashboard/blog`)
                                    .set('Authorization', `Bearer ${loggedAdminToken}`)
                                    .field('title', "Blog-1")
                                    .field('description', "blog-1 description")
                                    .attach('imageUrl', `${__dirname}/test-file/photo.webp`)

                                expect(res.statusCode).toBe(415);
                                expect(res.body.blog).toBeUndefined();
                            });
                        })
                    })
                    describe('if user is not authenticated', () => {
                        test('should not create blog', async () => {
                            const res = await request(app)
                                .put('/api/dashboard/blog/${blogId}');

                            expect(res.statusCode).toBe(401);
                            expect(res.body.blogs).toBeUndefined();
                        })
                    })
                })
                describe('Deleting a blog', () => {
                    describe('If user is authenticated as admin', () => {
                        test('should delete the blog', async () => {
                            const res = await request(app)
                                .delete(`/api/dashboard/blog/${blogId}`)
                                .set("Authorization", `Bearer ${loggedAdminToken}`);

                            expect(res.statusCode).toBe(200);
                            expect(res.body.message).toBeDefined();
                        })
                        describe('Doesn\'t delete blog', () => {
                            test('For incorrect syntax of _id', async () => {
                                const fakeBlogId = 'blog-123';
                                const res = await request(app)
                                    .delete(`/api/dashboard/blog/${fakeBlogId}`)
                                    .set('Authorization', `Bearer ${loggedAdminToken}`);;

                                expect(res.statusCode).toBe(400);
                                expect(res.body.blog).toBeUndefined();
                            });
                            test('For fake id', async () => {
                                const fakeBlogId = blogId.toString().split('').reverse().join('');

                                const res = await request(app)
                                    .delete(`/api/dashboard/blog/${fakeBlogId}`)
                                    .set('Authorization', `Bearer ${loggedAdminToken}`);

                                expect(res.statusCode).toBe(404);
                                expect(res.body.blog).toBeUndefined();
                            })
                        })
                    })
                    describe('If user is not authenticated', () => {
                        test('should delete not the blog', async () => {
                            const res = await request(app)
                                .delete(`/api/dashboard/blog/${blogId}`)

                            expect(res.statusCode).toBe(401);
                            expect(res.body.blog).toBeUndefined();

                        })
                    })
                })
            })
        })
        describe('Users Test', () => {
            describe('if user is authenticated as admin', () => {
                test('should return all users', async () => {
                    const res = await request(app)
                        .get('/api/dashboard/users')
                        .set("Authorization", `Bearer ${loggedAdminToken}`);

                    expect(res.statusCode).toBe(200);
                    expect(res.body.users).toBeDefined();
                })
            })

            describe('if user is not authenticated', () => {
                test('should not get any user', async () => {
                    const res = await request(app)
                        .get('/api/dashboard/users');

                    expect(res.statusCode).toBe(401);
                    expect(res.body.users).toBeUndefined();
                })
            })
        })
        describe('Message Test', () => {
            describe('Get all messages', () => {
                describe('if user is authenticated as admin', () => {
                    test('should return all messages', async () => {
                        const res = await request(app)
                            .get('/api/dashboard/messages')
                            .set("Authorization", `Bearer ${loggedAdminToken}`);

                        expect(res.statusCode).toBe(200);
                        expect(res.body.msg).toBeDefined();
                    })
                })
                describe('if user is not authenticated', () => {
                    test('should not get any message', async () => {
                        const res = await request(app)
                            .get('/api/dashboard/messages');

                        expect(res.statusCode).toBe(401);
                        expect(res.body.msg).toBeUndefined();
                    })
                })
            })
            describe('Get single message', () => {
                describe('If user is authenticated as admin', () => {
                    test('should return message for specific id', async () => {
                        const res = await request(app)
                            .get(`/api/dashboard/messages/${messageId}`)
                            .set("Authorization", `Bearer ${loggedAdminToken}`);

                        expect(res.statusCode).toBe(200);
                        expect(res.body.msg).toBeDefined();
                    })
                    test('Doesn\'t return any message, for incorrect syntax of _id', async () => {
                        const fakeBlogId = 'blog-123';
                        const res = await request(app)
                            .get(`/api/dashboard/messages/${fakeBlogId}`)
                            .set('Authorization', `Bearer ${loggedAdminToken}`);;

                        expect(res.statusCode).toBe(400);
                        expect(res.body.blog).toBeUndefined();
                    });
                    test('Doesn\'t return any message, for fake id', async () => {
                        const fakeBlogId = blogId.toString().split('').reverse().join('');

                        const res = await request(app)
                            .get(`/api/dashboard/messages/${fakeBlogId}`)
                            .set('Authorization', `Bearer ${loggedAdminToken}`);

                        expect(res.statusCode).toBe(404);
                        expect(res.body.blog).toBeUndefined();
                    })
                })
                describe('If user is not authenticated', () => {
                    test('should not return any message', async () => {
                        const res = await request(app)
                            .get(`/api/dashboard/messages/${messageId}`);

                        expect(res.statusCode).toBe(401);
                        expect(res.body.msg).toBeUndefined();
                    })
                })
            })
        })

        describe('Comments Retrieval test', () => {
            beforeAll(async () => {

                await Comment.create(
                    {
                        creatorId: userId2,
                        creatorName: "user2test",
                        blogId: blogId,
                        description: 'comment'
                    }
                )
            })

            test("should return comments", async () => {
                const res = await request(app)
                    .get('/api/dashboard/comments')
                    .set("Authorization", `Bearer ${loggedAdminToken}`);

                expect(res.statusCode).toBe(200)
                expect(res.body.comments).toBeDefined()
            })
        });
    })

    // Portfolio Test
    describe('PortfolioTest', () => {
        beforeAll(async () => {
            await Blog.create({
                _id: blogId,
                title: 'blog1',
                description: "xyz",
                imageUrl: 'xyz'
            });
            await User.create([
                {
                    _id: adminId,
                    name: "admintest",
                    photo: "phototest",
                    dob: "dobtest",
                    email: "admin@gmail.com",
                    password: 'adminpassword',
                    isAdmin: true
                },
                {
                    _id: userId,
                    name: "usertest",
                    photo: "phototest",
                    dob: "dobtest",
                    email: "test@gmail.com",
                    password: 'testpassword'
                }, {
                    _id: userId2,
                    name: "user2test",
                    photo: "phototest2",
                    dob: "dobtest2",
                    email: "test2@gmail.com",
                    password: 'test2password'
                }]
            );

        }, 10000)
        afterAll(async () => {
            await Blog.deleteMany();
            await User.deleteMany();
            await Like.deleteMany();
            await Comment.deleteMany();
            await Message.deleteMany();
        }, 10000)

        describe('BlogTest', () => {
            describe('Blog CRUD operation test', () => {
                describe('Get all blogs', () => {
                    test('should return all blogs', async () => {
                        const res = await request(app).get('/api/portfolio/blogs');
                        expect(res.statusCode).toBe(200);
                        expect(res.body.blogs).toBeDefined()
                    })
                })
                describe('Get single blog', () => {
                    test('should return blog for specific id', async () => {
                        const res = await request(app).get(`/api/portfolio/blog/${blogId}`);
                        expect(res.statusCode).toBe(200);
                        expect(res.body.blog).toBeDefined()
                    });
                    test('Doesn\'t return a blog, for incorrect syntax of _id', async () => {
                        const fakeBlogId = 'blog-123';
                        const res = await request(app).get(`/api/portfolio/blog/${fakeBlogId}`);
                        expect(res.statusCode).toBe(400);
                        expect(res.body).toBeInstanceOf(Object);
                    });
                    test('Doesn\'t return a blog, for fake id', async () => {
                        const fakeBlogId = blogId.toString().split('').reverse().join('');

                        const res = await request(app).get(`/api/portfolio/blog/${fakeBlogId}`);
                        expect(res.statusCode).toBe(404);
                        expect(res.body).toBeInstanceOf(Object);
                    });
                })
            })

            describe('BlogCommentTest', () => {
                describe('Get comments for specific blog', () => {
                    beforeAll(async () => {
                        await Comment.create({
                            _id: commentId,
                            creatorId: userId,
                            creatorName: "John Doe",
                            blogId: blogId,
                            description: "xyz"
                        })
                    });

                    afterAll(async () => {
                        await Comment.deleteMany();
                    })

                    test('should return all comments', async () => {
                        const res = await request(app).get(`/api/portfolio/blog/${blogId}/comment`);
                        expect(res.statusCode).toBe(200);
                        expect(res.body).toBeInstanceOf(Object);
                    });
                    describe('Doesn\'t return any comment', () => {
                        test('for incorrect syntax of _id', async () => {
                            const fakeBlogId = 'blog-123';
                            const res = await request(app).get(`/api/portfolio/blog/${fakeBlogId}/comment`);
                            expect(res.statusCode).toBe(400);
                            expect(res.body).toBeInstanceOf(Object);
                        });
                        test('for fake id', async () => {
                            const fakeBlogId = blogId.toString().split('').reverse().join('');

                            const res = await request(app).get(`/api/portfolio/blog/${fakeBlogId}/comment`);
                            expect(res.statusCode).toBe(404);
                            expect(res.body).toBeInstanceOf(Object);
                        });
                    })
                })
                describe('Creating new comment', () => {
                    describe('If user is authenticated', () => {
                        let loggedUserToken: string;

                        beforeAll(async () => {
                            loggedUserToken = userToken();
                        })

                        test('save the comment', async () => {
                            const res = await request(app)
                                .post(`/api/portfolio/blog/${blogId}/comment`)
                                .set('Authorization', `Bearer ${loggedUserToken}`)
                                .send({
                                    description: 'this comment'
                                })
                            expect(res.statusCode).toBe(201)
                            expect(res.body).toBeInstanceOf(Object)
                        })

                        describe("does not save comment", () => {
                            test('for incorrect syntax of _id', async () => {
                                const fakeBlogId = 'blog-123';
                                const res = await request(app)
                                    .post(`/api/portfolio/blog/${fakeBlogId}/comment`)
                                    .set('Authorization', `Bearer ${loggedUserToken}`)
                                    .send({
                                        description: 'this comment'
                                    })
                                expect(res.statusCode).toBe(400);
                                expect(res.body.message).toBeDefined();
                            });
                            test('for fake id', async () => {
                                const fakeBlogId = blogId.toString().split('').reverse().join('');

                                const res = await request(app)
                                    .post(`/api/portfolio/blog/${fakeBlogId}/comment`)
                                    .set('Authorization', `Bearer ${loggedUserToken}`)
                                    .send({
                                        description: 'this comment'
                                    })
                                expect(res.statusCode).toBe(404);
                                expect(res.body.message).toBeDefined();
                            });
                            describe('For Authenticated admin trying to comment or do other thing for only end-users', () => {
                                test('should not do any thing', async () => {
                                    const sampleUserToken = jwt.sign({
                                        email: "admin@gmail.com",
                                        userId: adminId.toString()
                                    },
                                        `${process.env.JWT_SECRET}`,
                                        { expiresIn: '1h' }
                                    );

                                    const res = await request(app)
                                        .post(`/api/portfolio/blog/${blogId}/comment`)
                                        .set('Authorization', `Bearer ${sampleUserToken}`)

                                    expect(res.statusCode).toBe(401);
                                })
                            })
                        })
                    });
                    describe('If user is not authenticated', () => {

                        test('does not save the comment', async () => {
                            const res = await request(app)
                                .post(`/api/portfolio/blog/${blogId}/comment`)
                                .set('Authorization', `Bearer dummy-token`)
                                .send({
                                    description: 'this comment'
                                })
                            expect(res.statusCode).toBe(401)
                            expect(res.body.message).toBeDefined();
                        })
                    })
                });
            })

            describe('BlogLikeTest', () => {
                describe('If user is authenticated', () => {
                    let loggedUserToken: string;

                    beforeAll(async () => {
                        loggedUserToken = userToken();
                    })
                    describe('Adding new like', () => {
                        test('saves like', async () => {
                            const res = await request(app)
                                .post(`/api/portfolio/blog/${blogId}/like`)
                                .set('Authorization', `Bearer ${loggedUserToken}`)
                            expect(res.statusCode).toBe(201)
                            expect(res.body.message).toBeDefined();
                        })
                        describe("does not save like", () => {
                            test('for incorrect syntax of blodId', async () => {
                                const fakeBlogId = 'blog-123';
                                const res = await request(app)
                                    .post(`/api/portfolio/blog/${fakeBlogId}/like`)
                                    .set('Authorization', `Bearer ${loggedUserToken}`)

                                expect(res.statusCode).toBe(400);
                                expect(res.body.message).toBeDefined();
                            });
                            test('for fake blogId', async () => {
                                const fakeBlogId = new mongoose.Types.ObjectId();

                                const res = await request(app)
                                    .post(`/api/portfolio/blog/${fakeBlogId.toString()}/like`)
                                    .set('Authorization', `Bearer ${loggedUserToken}`)

                                expect(res.statusCode).toBe(404);
                                expect(res.body.message).toBeDefined();
                            });
                            test('for like that already exist on specific blog', async () => {
                                const res = await request(app)
                                    .post(`/api/portfolio/blog/${blogId}/like`)
                                    .set('Authorization', `Bearer ${loggedUserToken}`)
                                    .send({})

                                expect(res.statusCode).toBe(409);
                                expect(res.body.message).toBeDefined();
                            });
                        })
                    });

                    describe('UserBlogLikeTest', () => {
                        test('Should Return Success Status Code', async () => {
                            const res = await request(app)
                                .get(`/api/portfolio/blog/${blogId}/like`)
                                .set('Authorization', `Bearer ${loggedUserToken}`)

                            expect(res.statusCode).toBe(200);
                        })

                        describe('Should Not Return Success Status Code', () => {

                            test('For incorrect syntax of blog Id', async () => {
                                const fakeBlogId = 'blog-id-123';
                                const res = await request(app)
                                    .get(`/api/portfolio/blog/${fakeBlogId}/like`)
                                    .set('Authorization', `Bearer ${loggedUserToken}`)

                                expect(res.statusCode).toBe(400)
                            });
                            test('For blog which does not exist', async () => {
                                const fakeBlogId = new mongoose.Types.ObjectId();

                                const res = await request(app)
                                    .get(`/api/portfolio/blog/${fakeBlogId.toString()}/like`)
                                    .set('Authorization', `Bearer ${loggedUserToken}`)

                                expect(res.statusCode).toBe(404)
                            });
                        })
                    })

                    describe('Removing like on blog', () => {
                        describe("does not remove like", () => {
                            test('for incorrect syntax of blodId', async () => {
                                const fakeBlogId = 'blog-123';
                                const res = await request(app)
                                    .post(`/api/portfolio/blog/${fakeBlogId}/like`)
                                    .set('Authorization', `Bearer ${loggedUserToken}`)

                                expect(res.statusCode).toBe(400);
                                expect(res.body.message).toBeDefined();
                            });
                            test('for fake blogId', async () => {
                                const fakeBlogId = new mongoose.Types.ObjectId();

                                const res = await request(app)
                                    .delete(`/api/portfolio/blog/${fakeBlogId.toString()}/like`)
                                    .set('Authorization', `Bearer ${loggedUserToken}`)

                                expect(res.statusCode).toBe(404);
                                expect(res.body.message).toBeDefined();
                            });
                            test('for user who didn\'t like that blog', async () => {
                                const fakeUserToken = jwt.sign(
                                    {
                                        email: "test2@gmail.com",
                                        userId: userId2
                                    },
                                    `${process.env.JWT_SECRET}`,
                                    { expiresIn: '1h' }
                                );

                                const res = await request(app)
                                    .delete(`/api/portfolio/blog/${blogId}/like`)
                                    .set('Authorization', `Bearer ${fakeUserToken}`)

                                expect(res.statusCode).toBe(404);
                                expect(res.body.message).toBeDefined();
                            });
                        })
                        test('removes like on blog', async () => {
                            const res = await request(app)
                                .delete(`/api/portfolio/blog/${blogId}/like`)
                                .set('Authorization', `Bearer ${loggedUserToken}`)
                            expect(res.statusCode).toBe(200);
                            expect(res.body.message).toBeDefined();
                        });
                    })
                    describe('If user is not authenticated', () => {

                        test('does not remove like on the blog', async () => {
                            const res = await request(app)
                                .delete(`/api/portfolio/blog/${blogId}/like`)
                                .set('Authorization', `Bearer dummy-token`)
                            expect(res.statusCode).toBe(401)
                            expect(res.body.message).toBeDefined();
                        })
                    })
                });
            })
        })


        describe('ContactFormMessageTest', () => {
            afterAll(async () => {
                await Comment.deleteMany();
            })
            test('should save the message', async () => {
                const data = {
                    _id: messageId,
                    email: 'example@gmail.com',
                    subject: 'abc',
                    description: 'abc'
                };

                const res = await request(app)
                    .post('/api/portfolio/message')
                    .send(data)
                expect(res.statusCode).toBe(201);
            })
        });

    })
})