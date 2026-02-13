import { UpsunClient } from '../../upsun.js';
import { Blob, Commit, Metrics, Ref, SystemInformation, Tree } from '../../model/index.js';
import { TaskBase } from './task_base.js';
import { RepositoryApi, SystemInformationApi } from '../../index.js';

// Si fetch n'est pas disponible nativement, utiliser node-fetch ou globalThis.fetch

export class RepositoriesTask extends TaskBase {
  constructor(
    protected readonly client: UpsunClient,
    private repositoryApi: RepositoryApi,
    private systemInfoApi: SystemInformationApi,
  ) {
    super(client);
  }

  /**
   * Get a Git blob by its ID in the specified project. This method retrieves the details of a Git blob, including its
   * content, encoding, and any relevant metadata. The blob ID should be a valid identifier for a Git blob within the
   * project's repository.
   * @param projectId - The ID of the project to retrieve the Git blob from.
   * @param repositoryBlobId - The ID of the Git blob to retrieve. This should be a valid identifier for a Git blob
   * within the project's repository.
   * @return The details of the specified Git blob, including its content, encoding, and any relevant metadata.
   * @throws An error if the project ID or repository blob ID is invalid, or if there is an issue with the API request.
   */
  async getGitBlob(projectId: string, repositoryBlobId: string): Promise<Blob> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkRepositoryBlobId(repositoryBlobId);

    return await this.repositoryApi.getProjectsGitBlobs({ projectId, repositoryBlobId });
  }

  /**
   * Get a Git commit by its ID in the specified project. This method retrieves the details of a Git commit, including
   * its message, author, committer, timestamp, and any relevant metadata. The commit ID should be a valid identifier
   * for a Git commit within the project's repository.
   * @param projectId - The ID of the project to retrieve the Git commit from.
   * @param repositoryCommitId - The ID of the Git commit to retrieve. This should be a valid identifier for a Git
   * commit within the project's repository.
   * @return The details of the specified Git commit, including its message, author, committer, timestamp, and any
   * relevant metadata.
   * @throws An error if the project ID or repository commit ID is invalid, or if there is an issue with the API
   * request.
   */
  async getGitCommit(projectId: string, repositoryCommitId: string): Promise<Commit> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkRepositoryCommitId(repositoryCommitId);

    return await this.repositoryApi.getProjectsGitCommits({ projectId, repositoryCommitId });
  }

  /**
   * Get a Git reference (e.g., branch or tag) by its ID in the specified project.
   * @param projectId
   * @param repositoryRefId Id of the Git reference to retrieve
   *        (e.g., "heads/main" for the main branch or "tags/v1.0" for a tag).
   * @returns
   */
  async getGitRef(projectId: string, repositoryRefId: string): Promise<Ref> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkRepositoryRefId(repositoryRefId);

    return await this.repositoryApi.getProjectsGitRefs({ projectId, repositoryRefId });
  }

  /**
   * List all Git references (e.g., branches and tags) in the specified project. This method retrieves a list of all Git
   * references that exist within the project's repository, including details such as the reference name, type
   * (branch or tag), and the commit it points to. The returned list includes the details of each Git reference that
   * belongs to the project.
   * @param projectId - The ID of the project to list Git references for.
   * @return A list of Git references (branches and tags) that exist within the specified project's repository,
   * including details such as the reference name, type, and the commit it points to.
   * @throws An error if the project ID is invalid, or if there is an issue with the API request.
   */
  async listGitRefs(projectId: string): Promise<Ref[]> {
    TaskBase.checkProjectId(projectId);

    return await this.repositoryApi.listProjectsGitRefs({ projectId });
  }

  /**
   * Get a Git tree by its ID in the specified project. This method retrieves the details of a Git tree, including its
   * entries (files and subdirectories), their types, and any relevant metadata. The tree ID should be a valid
   * identifier for a Git tree within the project's repository.
   * @param projectId - The ID of the project to retrieve the Git tree from.
   * @param repositoryTreeId - The ID of the Git tree to retrieve. This should be a valid identifier for a Git tree
   * within the project's repository.
   * @return The details of the specified Git tree, including its entries (files and subdirectories), their types, and any
   * relevant metadata.
   * @throws An error if the project ID or repository tree ID is invalid, or if there is an issue with the API request.
   */
  async getGitTree(projectId: string, repositoryTreeId: string): Promise<Tree> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkRepositoryTreeId(repositoryTreeId);

    return await this.repositoryApi.getProjectsGitTrees({ projectId, repositoryTreeId });
  }

  //TODO internal? seems that it's not public endpoint
  // async restartGitServer(projectId: string): Promise<AcceptedResponse> {
  //   TaskBase.checkProjectId(projectId);

  //   return await this.systemInfoApi.actionProjectsSystemRestart({ projectId });
  // }

  /**
   * Get GIT related system information for a project. This method retrieves details about the Git system associated
   * with the specified project.
   * @param projectId - The ID of the project to retrieve Git system information for.
   * @return The Git system information for the specified project, including details such as the Git server status,
   * repository information, and any relevant metadata about the Git system that is associated with the project.
   * @throws An error if the project ID is invalid, or if there is an issue with the API request.
   */
  async getGitInfo(projectId: string): Promise<SystemInformation> {
    TaskBase.checkProjectId(projectId);

    return await this.systemInfoApi.getProjectsSystem({ projectId });
  }
}
