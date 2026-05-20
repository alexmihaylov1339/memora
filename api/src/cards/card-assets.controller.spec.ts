import { BadRequestException } from '@nestjs/common';
import { CardAssetsController } from './card-assets.controller';

interface UploadedAssetFile {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
}

interface CardAssetsServiceMock {
  uploadAsset: jest.Mock<Promise<unknown>>;
}

function createCardAssetsServiceMock(): CardAssetsServiceMock {
  return {
    uploadAsset: jest.fn<Promise<unknown>, []>(),
  };
}

describe('CardAssetsController', () => {
  const mockUser = { id: 'user-1', email: 'kid@example.com' };

  it('uploads an image asset through the storage service', async () => {
    const cardAssets = createCardAssetsServiceMock();
    const controller = new CardAssetsController(cardAssets as never);
    const file = {
      buffer: Buffer.from('image-bytes'),
      mimetype: 'image/jpeg',
      originalname: 'car.jpg',
      size: 11,
    } as UploadedAssetFile;

    cardAssets.uploadAsset.mockResolvedValue({
      path: 'kids-images/user-1/asset-1/car.jpg',
      mimeType: 'image/jpeg',
      size: 11,
      url: 'https://example.com/image',
    });

    await expect(
      controller.uploadAsset(mockUser, { assetType: 'image' }, file),
    ).resolves.toEqual({
      path: 'kids-images/user-1/asset-1/car.jpg',
      mimeType: 'image/jpeg',
      size: 11,
      url: 'https://example.com/image',
    });

    expect(cardAssets.uploadAsset).toHaveBeenCalledWith({
      assetType: 'image',
      fileBuffer: file.buffer,
      mimeType: 'image/jpeg',
      originalName: 'car.jpg',
      size: 11,
      userId: 'user-1',
    });
  });

  it('rejects missing files', async () => {
    const controller = new CardAssetsController(
      createCardAssetsServiceMock() as never,
    );

    await expect(
      controller.uploadAsset(mockUser, { assetType: 'image' }, undefined),
    ).rejects.toThrow(new BadRequestException('No file uploaded'));
  });

  it('rejects unsupported asset types', async () => {
    const controller = new CardAssetsController(
      createCardAssetsServiceMock() as never,
    );
    const file = {
      buffer: Buffer.from('bytes'),
      mimetype: 'image/jpeg',
      originalname: 'car.jpg',
      size: 5,
    } as UploadedAssetFile;

    await expect(
      controller.uploadAsset(mockUser, { assetType: 'document' }, file),
    ).rejects.toThrow(
      new BadRequestException('assetType must be image or audio'),
    );
  });
});
