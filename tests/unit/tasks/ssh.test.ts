import { SshTask } from '../../../src/core/tasks/ssh.js';
import { UpsunClient } from '../../../src/upsun.js';
import { SSHKeysApi } from '../../../src/apis-gen/index.js';

// Mock the UpsunClient and SSHKeysApi
jest.mock('../../../src/upsun');
jest.mock('../../../src/apis-gen/index.js');

describe('SshTask', () => {
  let sshTask: SshTask;
  let mockClient: jest.Mocked<UpsunClient>;
  let mockSshApi: jest.Mocked<SSHKeysApi>;

  beforeEach(() => {
    mockSshApi = {
      createSshKey: jest.fn()
    } as any;

    (SSHKeysApi as jest.MockedClass<typeof SSHKeysApi>).mockImplementation(() => mockSshApi);

    mockClient = {
      apiConfig: {
        basePath: 'https://api.upsun.com'
      }
    } as any;
    
    sshTask = new SshTask(mockClient);
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
        created_at: '2023-01-01T00:00:00Z'
      };

      mockSshApi.createSshKey.mockResolvedValue(mockSshKey as any);

      const result = await sshTask.add('user-456', 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAAB...', 'test-key');
      expect(result).toBeDefined();
      expect(mockSshApi.createSshKey).toHaveBeenCalledWith({
        createSshKeyRequest: {
          uuid: 'user-456',
          value: 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAAB...',
          title: 'test-key'
        }
      });
    });

    it('should handle SSH key addition errors', async () => {
      mockSshApi.createSshKey.mockRejectedValue(new Error('SSH key already exists'));

      await expect(sshTask.add('user-456', 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAAB...', 'test-key'))
        .rejects.toThrow('SSH key already exists');
    });
  });

  describe('list', () => {
    it('should have list method defined', () => {
      expect(sshTask.list).toBeDefined();
      expect(typeof sshTask.list).toBe('function');
    });

    it('should throw "Method not implemented" error', () => {
      expect(() => sshTask.list('user-456')).toThrow('Method not implemented.');
    });
  });

  describe('delete', () => {
    it('should have delete method defined', () => {
      expect(sshTask.delete).toBeDefined();
      expect(typeof sshTask.delete).toBe('function');
    });

    it('should throw "Method not implemented" error', () => {
      expect(() => sshTask.delete('user-456', 'key-123')).toThrow('Method not implemented.');
    });
  });
});
