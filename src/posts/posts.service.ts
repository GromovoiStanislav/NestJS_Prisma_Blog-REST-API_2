import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePostDto } from "./dto/createPost.dto";
import { UpdatePostDto } from "./dto/updatePost.dto";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { PrismaError } from "../utils/prismaError";
import { PostNotFoundException } from "./exceptions/postNotFound.exception";
import { User } from "@prisma/client";

@Injectable()
export class PostsService {

  constructor(
    private readonly prismaService: PrismaService
  ) {
  }

  async getAllPosts() {
    return this.prismaService.post.findMany({
      include: {
        categories: true,
        _count: true
      }
    });
  }


  async getPostById(id: number) {
    const post = await this.prismaService.post.findUnique({
      where: {
        id
      },
      include: {
        categories: true,
        _count: true
      }
    });
    if (!post) {
      throw new PostNotFoundException(id);
    }
    return post;
  }


  async createPost(post: CreatePostDto, user: User) {

    const categories = post.categoryIds?.map((category) => ({
      id: category
    }));

    return this.prismaService.post.create({
      data: {
        title: post.title,
        content: post.content,
        author: {
          connect: {
            id: user.id
          }
        },
        categories: {
          connect: categories // set - перезаписывает!!! connect - добавляет!!!
        }
      },
      include: {
        categories: true,
        _count: true
      }
    });
  }

  async updatePost(id: number, post: UpdatePostDto) {
    await this.validateRecord(id)

    const categories = post.categoryIds?.map((category) => ({
      id: category
    }));
    delete post.categoryIds

    try {
      return await this.prismaService.post.update({
        where: {
          id
        },

        data: {
          ...post,
          id: undefined,
          categories: {
            set: categories // set - перезаписывает!!! connect - добавляет!!!
          }
        },

        include: {
          categories: true,
          _count: true
        }
      });
    } catch (error) {
      if (
        //error instanceof PrismaClientKnownRequestError &&
        error.code === PrismaError.RecordDoesNotExist
      ) {
        throw new PostNotFoundException(id);
      }
      throw error;
    }
  }

  async deletePost(id: number) {
    await this.validateRecord(id)

    try {
      return this.prismaService.post.delete({
        where: {
          id
        }
      });
    } catch (error) {
      if (
        //error instanceof PrismaClientKnownRequestError &&
        error.code === PrismaError.RecordDoesNotExist
      ) {
        throw new PostNotFoundException(id);
      }
      throw error;
    }
  }

  async validateRecord(id) {
    const post = await this.prismaService.post.findUnique({
      where: {
        id
      }
    });
    if (!post) {
      throw new PostNotFoundException(id);
    }
    return post;
  }
}
