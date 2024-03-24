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

import { Auth } from "../controllers/auth";

import "dotenv/config";



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


describe('PortfolioTest', () => {
    beforeAll(async () => {
        await mongoose.disconnect()
        await mongoose.connect(process.env.MONGODB_TEST_CONNECTION_STRING as string)
        await Blog.create({
            _id: blogId,
            title: 'blog1',
            description: "xyz",
            imageUrl: 'xyz'
        });
        await User.create([
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
    
    }, 60000)
    afterAll(async () => {
        await Blog.deleteMany();
        await User.deleteMany();
        await Like.deleteMany();
        await Comment.deleteMany();
        await Message.deleteMany();
        await mongoose.disconnect();
    }, 60000)

    describe('BlogTest', () => {
        describe('Blog CRUD operation test', () => {
            describe('Get all blogs', () => {
                test('should return all blogs', async () => {
                    const res = await request(app).get('/api/portfolio/blogs');
                    expect(res.statusCode).toBe(200);
                    expect(res.body).toBeInstanceOf(Object);
                })
            })
            describe('Get single blog', () => {
                test('should return blog for specific id', async () => {
                    const res = await request(app).get(`/api/portfolio/blog/${blogId}`);
                    expect(res.statusCode).toBe(200);
                    expect(res.body).toBeInstanceOf(Object);
                });
                test('doesn\'t return a blog, for incorrect syntax of id', async () => {
                    const fakeBlogId = 'blog-123';
                    const res = await request(app).get(`/api/portfolio/blog/${fakeBlogId}`);
                    expect(res.statusCode).toBe(400);
                    expect(res.body).toBeInstanceOf(Object);
                });
                test('doesn\'t return a blog, for fake id', async () => {
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
                describe('doesn\'t return any comment', () => {
                    test('for incorrect syntax of id', async () => {
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
                        test('for incorrect syntax of id', async () => {
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
                            const fakeBlogId = blogId.toString().split('').reverse().join('');

                            const res = await request(app)
                                .post(`/api/portfolio/blog/${fakeBlogId}/like`)
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
                            const fakeBlogId = blogId.toString().split('').reverse().join('');

                            const res = await request(app)
                                .post(`/api/portfolio/blog/${fakeBlogId}/like`)
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