import { SshTask } from '../../../src/core/tasks/ssh.js';
import { UpsunClient } from '../../../src/upsun.js';
import { SshKeysApi } from '../../../src/api/index.js';

// Mock the UpsunClient and SSHKeysApi
jest.mock('../../../src/upsun');
jest.mock('../../../src/api/index.js');

describe('SshTask', () => {
  let sshTask: SshTask;
  let mockClient: jest.Mocked<UpsunClient>;
  let mockSshApi: jest.Mocked<SshKeysApi>;

  beforeEach(() => {
    mockSshApi = {
      createSshKey: jest.fn(),
      deleteSshKey: jest.fn(),
    } as any;

    (SshKeysApi as jest.MockedClass<typeof SshKeysApi>).mockImplementation(() => mockSshApi);

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

  describe('add', () => {
    it('should have add method defined', () => {
      expect(sshTask.add).toBeDefined();
      expect(typeof sshTask.add).toBe('function');
    });

    it('should add an SSH key', async () => {
      const mockSshKey = {
        id: 'key-123',
        title: 'test-key',
        value: 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAAB...',
        created_at: '2023-01-01T00:00:00Z',
      };

      mockSshApi.createSshKey.mockResolvedValue(mockSshKey as any);

      const result = await sshTask.add(
        'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAAB...',
        'user-456',
        'test-key',
      );
      expect(result).toBeDefined();
      expect(mockSshApi.createSshKey).toHaveBeenCalledWith({
        createSshKeyRequest: {
          uuid: 'user-456',
          value: 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAAB...',
          title: 'test-key',
        },
      });
    });

    it('should handle SSH key addition errors', async () => {
      mockSshApi.createSshKey.mockRejectedValue(new Error('SSH key already exists'));

      await expect(
        sshTask.add('ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAAB...', 'user-456', 'test-key'),
      ).rejects.toThrow('SSH key already exists');
    });
  });

  describe('delete', () => {
    it('should have delete method defined', () => {
      expect(sshTask.delete).toBeDefined();
      expect(typeof sshTask.delete).toBe('function');
    });

    it('should delete an SSH key', async () => {
      mockSshApi.deleteSshKey.mockResolvedValue(undefined as any);

      await sshTask.delete(123);
      expect(mockSshApi.deleteSshKey).toHaveBeenCalledWith({ keyId: 123 });
    });
  });
});
