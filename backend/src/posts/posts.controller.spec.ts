import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

describe('PostsController', () => {
  let controller: PostsController;
  let postsService: jest.Mocked<Partial<PostsService>>;

  beforeEach(async () => {
    postsService = {
      create: jest.fn(),
      findByUser: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [{ provide: PostsService, useValue: postsService }],
    }).compile();

    controller = module.get<PostsController>(PostsController);
  });

  it('create passes user id and dto to service', () => {
    const dto = { description: 'test', songs: [] };
    const req = { user: { id: 3 } };

    controller.create(req, dto);

    expect(postsService.create).toHaveBeenCalledWith(3, dto);
  });

  it('mine returns user posts', () => {
    const req = { user: { id: 3 } };
    postsService.findByUser!.mockReturnValue([] as any);

    controller.mine(req);

    expect(postsService.findByUser).toHaveBeenCalledWith(3);
  });

  it('remove passes id and user id to service', () => {
    const req = { user: { id: 3 } };

    controller.remove('7', req);

    expect(postsService.remove).toHaveBeenCalledWith(7, 3);
  });
});
