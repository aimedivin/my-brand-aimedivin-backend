import supertest from "supertest";
import { Auth } from "../controllers/auth";
import { app } from "../app";
import mongoose from "mongoose";

import 'dotenv/config'
import { Dashboard } from "../controllers/dashboard";

// Controller Object
const authController = new Auth();
const dashboardController = new Dashboard();

const request = {
    body: {
        email: 'fake email',
        password: 'fake password'
    }
}

const userInput = {
    email: "test@example.com",
    name: "Jane Doe",
    password: "Password123",
};

const blogPayload = {
    _id: new mongoose.Types.ObjectId().toString(),
    title: "Add your name in the body",
    description: "amazing",
    imageUrl: "xyzz"
};


beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string);
});

afterAll(async () => {
    await mongoose.disconnect();
}, 100000);

describe('blog', () => {
    describe('get blog', () => {
        describe('given Id(Fake Id) of blog does not exists', () => {
            it('should return 404', async () => {
                const blogId = 'blog-123';
                await supertest(app).get(`/api/portfolio/blog/${blogId}`).expect(404);

            })
        })
        describe('given Id of blog does exists', () => {
            it('should return 200', async () => {
                const blogId = 'blog-123';
                // const blog = await dashboardController.postBlog(request, response)
                await supertest(app)
                    .get(`/api/portfolio/blog/${blogPayload._id}`)
                    .expect(200);
            })
        })
    })
})
