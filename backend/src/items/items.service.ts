import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './item.entity';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
  ) {}

  findAll(): Promise<Item[]> {
    return this.itemsRepository.find();
  }

  async findOne(id: number): Promise<Item> {
    const item = await this.itemsRepository.findOneBy({ id });
    if (!item) throw new NotFoundException(`Item #${id} not found`);
    return item;
  }

  create(data: Partial<Item>): Promise<Item> {
    const item = this.itemsRepository.create(data);
    return this.itemsRepository.save(item);
  }

  async update(id: number, data: Partial<Item>): Promise<Item> {
    await this.findOne(id);
    await this.itemsRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.itemsRepository.delete(id);
  }
}
