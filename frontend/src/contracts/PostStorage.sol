// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PostStorage {
    struct Post {
        string imageHash;
        string caption;
        string hashtags;
        address walletAddress;
    }

    mapping(uint256 => Post) public posts;
    uint256 public postsCount;

    event NewPostCreated(
        uint256 indexed postId,
        string imageHash,
        string caption,
        string hashtags,
        address indexed walletAddress
    );

    function createPost(string memory imageHash, string memory caption, string memory hashtags) public {
        posts[postsCount] = Post(imageHash, caption, hashtags, msg.sender);
        emit NewPostCreated(postsCount, imageHash, caption, hashtags, msg.sender);
        postsCount++;
    }

    function getPost(uint256 postId) public view returns (string memory, string memory, string memory, address) {
        require(postId < postsCount, "Invalid postId");
        Post memory post = posts[postId];
        return (post.imageHash, post.caption, post.hashtags, post.walletAddress);
    }

    function getPostsCount() public view returns (uint256) {
        return postsCount;
    }
}
