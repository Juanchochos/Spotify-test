import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ItemsService } from './items.service';
import { Item } from './item.entity';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  findAll(): Promise<Item[]> {
    return this.itemsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Item> {
    return this.itemsService.findOne(+id);
  }

  @Post()
  create(@Body() body: Partial<Item>): Promise<Item> {
    return this.itemsService.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<Item>): Promise<Item> {
    return this.itemsService.update(+id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.itemsService.remove(+id);
  }
}
