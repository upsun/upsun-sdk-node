import { SshTask } from '../../../src/core/tasks/ssh.js';
import { UpsunClient } from '../../../src/upsun.js';
import { SshApi } from '../../../src/api/index.js';

jest.mock('../../../src/upsun');
jest.mock('../../../src/api/index.js');

describe('SshTask', () => {
  let sshTask: SshTask;
  let mockClient: jest.Mocked<UpsunClient>;
  let mockSshApi: jest.Mocked<SshApi>;

  beforeEach(() => {
    mockSshApi = {
      createUserSshKey: jest.fn(),
      getUserSshKey: jest.fn(),
      listUserSshKeys: jest.fn(),
      deleteUserSshKey: jest.fn(),
    } as any;

    (SshApi as jest.MockedClass<typeof SshApi>).mockImplementation(() => mockSshApi);

    mockClient = {
      apiConfig: {
        basePath: 'https://api.upsun.com',
      },
    } as any;

    sshTask = new SshTask(mockClient, mockSshApi);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should instantiate with default SshApi when API is not provided', () => {
      const task = new SshTask(mockClient);
      expect(task).toBeDefined();
      expect(SshApi).toHaveBeenCalled();
    });
  });

  describe('add', () => {
    it('should add an SSH key to the user', async () => {
      const sshKey = { id: 'key-123', label: 'laptop', value: 'ssh-ed25519 AAAA' };
      mockSshApi.createUserSshKey.mockResolvedValue(sshKey as any);

      const result = await sshTask.add('user-456', 'ssh-ed25519 AAAA', 'laptop');

      expect(result).toBe(sshKey);
      expect(mockSshApi.createUserSshKey).toHaveBeenCalledWith({
        userId: 'user-456',
        createUserSshKeyRequest: { value: 'ssh-ed25519 AAAA', label: 'laptop' },
      });
    });

    it('should add an SSH key without a label', async () => {
      mockSshApi.createUserSshKey.mockResolvedValue({} as any);

      await sshTask.add('user-456', 'ssh-ed25519 AAAA');

      expect(mockSshApi.createUserSshKey).toHaveBeenCalledWith({
        userId: 'user-456',
        createUserSshKeyRequest: { value: 'ssh-ed25519 AAAA', label: undefined },
      });
    });

    it('should propagate API errors', async () => {
      mockSshApi.createUserSshKey.mockRejectedValue(new Error('SSH key already exists'));

      await expect(sshTask.add('user-456', 'ssh-ed25519 AAAA')).rejects.toThrow(
        'SSH key already exists',
      );
    });

    it('should require a user ID', async () => {
      await expect(sshTask.add('', 'ssh-ed25519 AAAA')).rejects.toThrow('User ID is required');
      expect(mockSshApi.createUserSshKey).not.toHaveBeenCalled();
    });

    it('should require a key value', async () => {
      await expect(sshTask.add('user-456', '')).rejects.toThrow('SSH key value is required');
      expect(mockSshApi.createUserSshKey).not.toHaveBeenCalled();
    });
  });

  describe('get', () => {
    it('should get an SSH key of the user', async () => {
      const sshKey = { id: 'key-123', label: 'laptop' };
      mockSshApi.getUserSshKey.mockResolvedValue(sshKey as any);

      const result = await sshTask.get('user-456', 'key-123');

      expect(result).toBe(sshKey);
      expect(mockSshApi.getUserSshKey).toHaveBeenCalledWith({
        userId: 'user-456',
        keyId: 'key-123',
      });
    });

    it('should require a user ID', async () => {
      await expect(sshTask.get('', 'key-123')).rejects.toThrow('User ID is required');
    });

    it('should require a key ID', async () => {
      await expect(sshTask.get('user-456', '')).rejects.toThrow('SSH key ID is required');
    });
  });

  describe('list', () => {
    it('should list the SSH keys of the user with the filters', async () => {
      const page = { items: [{ id: 'key-123' }], count: 1 };
      mockSshApi.listUserSshKeys.mockResolvedValue(page as any);

      const result = await sshTask.list('user-456', { pageSize: 10 });

      expect(result).toBe(page);
      expect(mockSshApi.listUserSshKeys).toHaveBeenCalledWith({
        userId: 'user-456',
        pageSize: 10,
      });
    });

    it('should list the SSH keys of the user without filters', async () => {
      mockSshApi.listUserSshKeys.mockResolvedValue({} as any);

      await sshTask.list('user-456');

      expect(mockSshApi.listUserSshKeys).toHaveBeenCalledWith({ userId: 'user-456' });
    });

    it('should require a user ID', async () => {
      await expect(sshTask.list('')).rejects.toThrow('User ID is required');
    });
  });

  describe('delete', () => {
    it('should delete an SSH key of the user', async () => {
      mockSshApi.deleteUserSshKey.mockResolvedValue(undefined);

      await sshTask.delete('user-456', 'key-123');

      expect(mockSshApi.deleteUserSshKey).toHaveBeenCalledWith({
        userId: 'user-456',
        keyId: 'key-123',
      });
    });

    it('should require a user ID', async () => {
      await expect(sshTask.delete('', 'key-123')).rejects.toThrow('User ID is required');
    });

    it('should require a key ID', async () => {
      await expect(sshTask.delete('user-456', '')).rejects.toThrow('SSH key ID is required');
    });
  });
});
