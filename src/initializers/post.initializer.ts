import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { Comment } from '../database/schemas/comment.schema';
import { POST_MODEL, COMMENT_MODEL } from '../database/constants';
import { Post } from '../database/schemas/post.schema';
import { CreatePostDto } from '../modules/post/dto/create-post.dto';

@Injectable()
export class PostDataInitializerService implements OnModuleInit {
	private data: CreatePostDto[] = [
		{
			title: 'Generate a NestJS project',
			content: 'content',
		},
		{
			title: 'Create CRUD RESTful APIs',
			content: 'content',
		},
		{
			title: 'Connect to MongoDB',
			content: 'content',
		},
	];

	constructor(
		@Inject(POST_MODEL) private readonly postModel: Model<Post>,
		@Inject(COMMENT_MODEL) private readonly commentModel: Model<Comment>,
	) { }

	async onModuleInit(): Promise<void> {
		console.log('(PostModule) is initialized...');
		try {
			await this.postModel.deleteMany({});
			await this.commentModel.deleteMany({});
			const createdPosts = await this.postModel.insertMany(this.data);
			console.log(createdPosts);
		} catch (error) {
			console.error('Error initializing data:', error);
		}
	}
}
