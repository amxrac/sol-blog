import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Blog } from "../target/types/blog";
import { PublicKey } from "@solana/web3.js";
import { expect, use } from "chai";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { createHash } from "crypto";
import { fail } from "assert";

describe("blog", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.blog as Program<Blog>;

  const blogOwner1 = anchor.web3.Keypair.generate();
  const blogOwner2 = anchor.web3.Keypair.generate();
  const commentAuthor1 = anchor.web3.Keypair.generate();
  const commentAuthor2 = anchor.web3.Keypair.generate();
  const blogTitle1 = "sample blog title1";
  const blogDescription1 = "sample blog description1";
  const blogTitle2 = "sample blog title2";
  const blogDescription2 = "sample blog description2";
  const blogTitle3 =
    "sample blog title3 which is far longer than the fifty character limit and thus invalid";
  const blogDescription3 =
    "sample blog description3 which is far longer than the character limit of one hundred characters and thus invalid. this gets real wordy, and becomes a mouthful, just going on and on and on. who has such time? it could pass for a post, with how windy it gets. a description should briefly describe. no need for long talk.";
  const blogTitle4 = "sample blog title4";
  const blogTitle5 = "sample blog title5";

  const blogPost1 = "sample blog post1";
  const blogPostContent = "sample blog post content";
  const blogPost2 = "sample blog post2";
  const blogPost3 = "sample blog post2";
  const blogPost4 =
    "sample blog post4 which is far longer than the fifty character limit and thus invalid.";
  const blogPost5 = "sample blog post5";
  const blogPost01 = "nonexistent blog post";
  const blogPostContentUpdate1 = "updated sample blog post content1";
  const blogPostContentUpdate2 = "updated sample blog post content2";

  const commentContent1 = "sample blog post content";
  const commentContent2 =
    "lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl. Nullam auctor, nisl eget ultricies tincidunt.";

  before(async () => {
    const blogOwnerSig = await provider.connection.requestAirdrop(
      blogOwner1.publicKey,
      LAMPORTS_PER_SOL * 10
    );
    const blogOwnerBh = await provider.connection.getLatestBlockhash();
    await provider.connection.confirmTransaction({
      signature: blogOwnerSig,
      blockhash: blogOwnerBh,
      lastValidBlockHeight: blogOwnerBh.lastValidBlockHeight,
    });

    const commentAuthorSig = await provider.connection.requestAirdrop(
      commentAuthor1.publicKey,
      LAMPORTS_PER_SOL * 10
    );
    const commentAuthorBh = await provider.connection.getLatestBlockhash();
    await provider.connection.confirmTransaction({
      signature: commentAuthorSig,
      blockhash: commentAuthorBh,
      lastValidBlockHeight: commentAuthorBh.lastValidBlockHeight,
    });
  });

  describe("initialize blog", async () => {
    it("should successfully initialize a blog with valid title and description for an owner", async () => {
      const [blogAddress] = getBlogAddress(
        blogTitle1,
        blogOwner1.publicKey,
        program.programId
      );

      await program.methods
        .initializeBlog(blogTitle1, blogDescription1)
        .accounts({
          owner: blogOwner1.publicKey,
          blog: blogAddress,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([blogOwner1])
        .rpc();

      const blogAccount = await program.account.blog.fetch(blogAddress);
      expect(blogAccount.title).to.equal(blogTitle1);
      expect(blogAccount.description).to.equal(blogDescription1);
      expect(blogAccount.owner.toString()).to.equal(
        blogOwner1.publicKey.toString()
      );
      expect(blogAccount.numberOfPosts.toNumber()).to.equal(0);
    });

    it("should successfully initialize a different blog by the same owner", async () => {
      const [blogAddress] = getBlogAddress(
        blogTitle2,
        blogOwner1.publicKey,
        program.programId
      );

      await program.methods
        .initializeBlog(blogTitle2, blogDescription2)
        .accounts({
          owner: blogOwner1.publicKey,
          blog: blogAddress,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([blogOwner1])
        .rpc();

      const blogAccount = await program.account.blog.fetch(blogAddress);
      expect(blogAccount.title).to.equal(blogTitle2);
      expect(blogAccount.description).to.equal(blogDescription2);
      expect(blogAccount.owner.toString()).to.equal(
        blogOwner1.publicKey.toString()
      );
      expect(blogAccount.numberOfPosts.toNumber()).to.equal(0);
    });

    it("should fail to initialize a blog that already exists by the same owner", async () => {
      const [blogAddress] = getBlogAddress(
        blogTitle1,
        blogOwner1.publicKey,
        program.programId
      );

      try {
        program.methods
          .initializeBlog(blogTitle1, blogDescription1)
          .accounts({
            owner: blogOwner1.publicKey,
            blog: blogAddress,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([blogOwner1])
          .rpc();
        expect.fail("expected transaction to fail but it succeeded");
      } catch (err) {
        expect(err).to.exist;
      }
    });

    it("should fail to initialize a blog when the title exceeds maximum length of 50", async () => {
      try {
        const [blogAddress] = getBlogAddress(
          blogTitle3,
          blogOwner1.publicKey,
          program.programId
        );

        await program.methods
          .initializeBlog(blogTitle3, blogDescription3)
          .accounts({
            owner: blogOwner1.publicKey,
            blog: blogAddress,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([blogOwner1])
          .rpc();
        expect.fail("expected transaction to fail but it succeeded");
      } catch (err) {
        expect(err).to.exist;
      }
    });

    it("should fail to initialize a blog when the description exceeds maximum length of 100", async () => {
      const [blogAddress] = getBlogAddress(
        blogTitle4,
        blogOwner1.publicKey,
        program.programId
      );

      try {
        await program.methods
          .initializeBlog(blogTitle1, blogDescription3)
          .accounts({
            owner: blogOwner1.publicKey,
            blog: blogAddress,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([blogOwner1])
          .rpc();
        expect.fail("expected transaction to fail but it succeeded");
      } catch (err) {
        expect(err).to.exist;
      }
    });
  });

  describe("create blog post", async () => {
    it("should successfully create a blog post with valid title and content for an already existing blog", async () => {
      const [blogPostAddress] = getBlogPostAddress(
        blogPost1,
        blogOwner1.publicKey,
        program.programId
      );
      const [blogAddress] = getBlogAddress(
        blogTitle1,
        blogOwner1.publicKey,
        program.programId
      );

      await program.methods
        .createBlogPost(blogPost1, blogPostContent)
        .accounts({
          owner: blogOwner1.publicKey,
          blogPost: blogPostAddress,
          blog: blogAddress,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([blogOwner1])
        .rpc();

      const blogAccount = await program.account.blog.fetch(blogAddress);
      const blogPostAccount = await program.account.blogPost.fetch(
        blogPostAddress
      );
      expect(blogPostAccount.title).to.equal(blogPost1);
      expect(blogPostAccount.content).to.equal(blogPostContent);
      expect(blogPostAccount.numberOfComments.eq(new anchor.BN(0))).to.be.true;
      expect(blogPostAccount.blog.toString()).to.equal(blogAddress.toString());
      expect(blogAccount.numberOfPosts.eq(new anchor.BN(1))).to.be.true;
    });

    it("should successfully create a different blog posts with a valid title and content for an already existing blog", async () => {
      const [blogPostAddress] = getBlogPostAddress(
        blogPost2,
        blogOwner1.publicKey,
        program.programId
      );
      const [blogAddress] = getBlogAddress(
        blogTitle1,
        blogOwner1.publicKey,
        program.programId
      );

      await program.methods
        .createBlogPost(blogPost2, blogPostContent)
        .accounts({
          owner: blogOwner1.publicKey,
          blogPost: blogPostAddress,
          blog: blogAddress,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([blogOwner1])
        .rpc();

      const blogAccount = await program.account.blog.fetch(blogAddress);
      const blogPostAccount = await program.account.blogPost.fetch(
        blogPostAddress
      );
      expect(blogPostAccount.title).to.equal(blogPost2);
      expect(blogPostAccount.content).to.equal(blogPostContent);
      expect(blogPostAccount.numberOfComments.eq(new anchor.BN(0))).to.be.true;
      expect(blogPostAccount.blog.toString()).to.equal(blogAddress.toString());
      expect(blogAccount.numberOfPosts.eq(new anchor.BN(2))).to.be.true;
    });

    it("should fail to create a blog post with an existing title an already existing blog", async () => {
      try {
        const [blogPostAddress] = getBlogPostAddress(
          blogPost1,
          blogOwner1.publicKey,
          program.programId
        );
        const [blogAddress] = getBlogAddress(
          blogTitle1,
          blogOwner1.publicKey,
          program.programId
        );

        await program.methods
          .createBlogPost(blogPost1, blogPostContent)
          .accounts({
            owner: blogOwner1.publicKey,
            blogPost: blogPostAddress,
            blog: blogAddress,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([blogOwner1])
          .rpc();
      } catch (err) {
        expect(err).to.exist;
      }
    });

    it("should fail to create a blog post with an unauthorized blog owner", async () => {
      try {
        const [blogPostAddress] = getBlogPostAddress(
          blogPost3,
          blogOwner2.publicKey,
          program.programId
        );
        const [blogAddress] = getBlogAddress(
          blogTitle1,
          blogOwner2.publicKey,
          program.programId
        );

        await program.methods
          .createBlogPost(blogPost3, blogPostContent)
          .accounts({
            owner: blogOwner2.publicKey,
            blogPost: blogPostAddress,
            blog: blogAddress,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([blogOwner2])
          .rpc();
      } catch (err) {
        expect(err).to.exist;
      }
    });

    it("should fail to create a blog post when the title exceeds the minimum length of 50", async () => {
      try {
        const [blogPostAddress] = getBlogPostAddress(
          blogPost4,
          blogOwner1.publicKey,
          program.programId
        );
        const [blogAddress] = getBlogAddress(
          blogTitle3,
          blogOwner1.publicKey,
          program.programId
        );

        await program.methods
          .createBlogPost(blogPost4, blogPostContent)
          .accounts({
            owner: blogOwner1.publicKey,
            blogPost: blogPostAddress,
            blog: blogAddress,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([blogOwner1])
          .rpc();
      } catch (err) {
        expect(err).to.exist;
      }
    });

    it("should fail to create a blog post for a non-existent blog", async () => {
      try {
        const [blogPostAddress] = getBlogPostAddress(
          blogPost4,
          blogOwner1.publicKey,
          program.programId
        );
        const [blogAddress] = getBlogAddress(
          blogTitle01,
          blogOwner1.publicKey,
          program.programId
        );

        await program.methods
          .createBlogPost(blogPost4, blogPostContent)
          .accounts({
            owner: blogOwner1.publicKey,
            blogPost: blogPostAddress,
            blog: blogAddress,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([blogOwner1])
          .rpc();
      } catch (err) {
        expect(err).to.exist;
      }
    });
  });

  describe("update blog post", async () => {
    it("should successfully update the content of a given blog post", async () => {
      const [blogPostAddress] = getBlogPostAddress(
        blogPost1,
        blogOwner1.publicKey,
        program.programId
      );
      const [blogAddress] = getBlogAddress(
        blogTitle1,
        blogOwner1.publicKey,
        program.programId
      );

      await program.methods
        .updateBlogPost(blogPost1, blogPostContentUpdate1)
        .accounts({
          owner: blogOwner1.publicKey,
          blogPost: blogPostAddress,
          blog: blogAddress,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([blogOwner1])
        .rpc();

      const blogAccount = await program.account.blog.fetch(blogAddress);
      const blogPostAccount = await program.account.blogPost.fetch(
        blogPostAddress
      );
      expect(blogPostAccount.title).to.equal(blogPost1);
      expect(blogPostAccount.content).to.equal(blogPostContentUpdate1);
      expect(blogPostAccount.numberOfComments.eq(new anchor.BN(0))).to.be.true;
      expect(blogPostAccount.blog.toString()).to.equal(blogAddress.toString());
      expect(blogAccount.numberOfPosts.eq(new anchor.BN(2))).to.be.true;
    });

    it("should successfully update the content of a different blog posts", async () => {
      const [blogPostAddress] = getBlogPostAddress(
        blogPost2,
        blogOwner1.publicKey,
        program.programId
      );
      const [blogAddress] = getBlogAddress(
        blogTitle1,
        blogOwner1.publicKey,
        program.programId
      );

      await program.methods
        .updateBlogPost(blogPost2, blogPostContentUpdate2)
        .accounts({
          owner: blogOwner1.publicKey,
          blogPost: blogPostAddress,
          blog: blogAddress,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([blogOwner1])
        .rpc();

      const blogAccount = await program.account.blog.fetch(blogAddress);
      const blogPostAccount = await program.account.blogPost.fetch(
        blogPostAddress
      );
      expect(blogPostAccount.title).to.equal(blogPost2);
      expect(blogPostAccount.content).to.equal(blogPostContentUpdate2);
      expect(blogPostAccount.numberOfComments.eq(new anchor.BN(0))).to.be.true;
      expect(blogPostAccount.blog.toString()).to.equal(blogAddress.toString());
      expect(blogAccount.numberOfPosts.eq(new anchor.BN(2))).to.be.true;
    });

    it("should fail to update the content of a blog post for unauthorized blog owner", async () => {
      try {
        const [blogPostAddress] = getBlogPostAddress(
          blogPost2,
          blogOwner2.publicKey,
          program.programId
        );
        const [blogAddress] = getBlogAddress(
          blogTitle1,
          blogOwner2.publicKey,
          program.programId
        );

        await program.methods
          .updateBlogPost(blogPost2, blogPostContentUpdate2)
          .accounts({
            owner: blogOwner2.publicKey,
            blogPost: blogPostAddress,
            blog: blogAddress,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([blogOwner2])
          .rpc();
      } catch (err) {
        expect(err).to.exist;
      }
    });

    it("should fail the update the content of a nonexistent blog post", async () => {
      try {
        const [blogPostAddress] = getBlogPostAddress(
          blogPost01,
          blogOwner1.publicKey,
          program.programId
        );
        const [blogAddress] = getBlogAddress(
          blogTitle1,
          blogOwner1.publicKey,
          program.programId
        );

        await program.methods
          .updateBlogPost(blogPost1, blogPostContentUpdate1)
          .accounts({
            owner: blogOwner1.publicKey,
            blogPost: blogPostAddress,
            blog: blogAddress,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([blogOwner1])
          .rpc();
      } catch (err) {
        expect(err).to.exist;
      }
    });
  });

  describe("delete blog post", async () => {
    it("should successfully delete a blog post with valid title and content for an already existing blog", async () => {
      const [blogPostAddress] = getBlogPostAddress(
        blogPost1,
        blogOwner1.publicKey,
        program.programId
      );
      const [blogAddress] = getBlogAddress(
        blogTitle1,
        blogOwner1.publicKey,
        program.programId
      );

      await program.methods
        .deleteBlogPost(blogPost1)
        .accounts({
          owner: blogOwner1.publicKey,
          blogPost: blogPostAddress,
          blog: blogAddress,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([blogOwner1])
        .rpc();

      const blogAccount = await program.account.blog.fetch(blogAddress);
      expect(blogAccount.numberOfPosts.eq(new anchor.BN(1))).to.be.true;
    });

    it("should successfully delete a different blog posts with a valid title and content for an already existing blog", async () => {
      const [blogPostAddress] = getBlogPostAddress(
        blogPost2,
        blogOwner1.publicKey,
        program.programId
      );
      const [blogAddress] = getBlogAddress(
        blogTitle1,
        blogOwner1.publicKey,
        program.programId
      );

      await program.methods
        .deleteBlogPost(blogPost2)
        .accounts({
          owner: blogOwner1.publicKey,
          blogPost: blogPostAddress,
          blog: blogAddress,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([blogOwner1])
        .rpc();

      const blogAccount = await program.account.blog.fetch(blogAddress);
      expect(blogAccount.numberOfPosts.eq(new anchor.BN(0))).to.be.true;
    });
  });

  describe("add comment", async () => {
    it("Should successfully add a comment with valid length to blog post", async () => {
      const [blogAddress] = getBlogAddress(
        blogTitle1,
        blogOwner1.publicKey,
        program.programId
      );

      const [blogPostAddress] = getBlogPostAddress(
        blogPost1,
        blogOwner1.publicKey,
        program.programId
      );

      const [commentAddress] = getCommentAddress(
        blogPostAddress,
        commentAuthor1.publicKey,
        program.programId
      );

      await program.methods
        .createBlogPost(blogPost1, blogPostContent)
        .accounts({
          owner: blogOwner1.publicKey,
          blogPost: blogPostAddress,
          blog: blogAddress,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([blogOwner1])
        .rpc();

      await program.methods
        .addComment(blogPost1, commentContent1)
        .accounts({
          commentAuthor: commentAuthor1.publicKey,
          comment: commentAddress,
          blogPost: blogPostAddress,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([commentAuthor1])
        .rpc();

      const blogPostAccount = await program.account.blogPost.fetch(
        blogPostAddress
      );
      const commentAccount = await program.account.comment.fetch(
        commentAddress
      );
      expect(commentAccount.commentAuthor.equals(commentAuthor1.publicKey)).to
        .be.true;
      expect(commentAccount.blogPost.equals(blogPostAddress)).to.be.true;

      expect(commentAccount.content).to.equal(commentContent1);
      expect(blogPostAccount.numberOfComments.eq(new anchor.BN(1))).to.be.true;
    });

    it("Should successfully add a comment with valid length to a different blog post", async () => {
      const [blogAddress] = getBlogAddress(
        blogTitle1,
        blogOwner1.publicKey,
        program.programId
      );

      const [blogPostAddress] = getBlogPostAddress(
        blogPost2,
        blogOwner1.publicKey,
        program.programId
      );

      const [commentAddress] = getCommentAddress(
        blogPostAddress,
        commentAuthor1.publicKey,
        program.programId
      );

      await program.methods
        .createBlogPost(blogPost2, blogPostContent)
        .accounts({
          owner: blogOwner1.publicKey,
          blogPost: blogPostAddress,
          blog: blogAddress,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([blogOwner1])
        .rpc();

      await program.methods
        .addComment(blogPost2, commentContent1)
        .accounts({
          commentAuthor: commentAuthor1.publicKey,
          comment: commentAddress,
          blogPost: blogPostAddress,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([commentAuthor1])
        .rpc();

      const blogPostAccount = await program.account.blogPost.fetch(
        blogPostAddress
      );
      const commentAccount = await program.account.comment.fetch(
        commentAddress
      );
      expect(commentAccount.commentAuthor.equals(commentAuthor1.publicKey)).to
        .be.true;
      expect(commentAccount.blogPost.equals(blogPostAddress)).to.be.true;
      expect(commentAccount.content).to.equal(commentContent1);
      expect(blogPostAccount.numberOfComments.eq(new anchor.BN(1))).to.be.true;
    });

    it("should fail to add a comment it exceeds the maximum length of 300", async () => {
      const [blogAddress] = getBlogAddress(
        blogTitle1,
        blogOwner1.publicKey,
        program.programId
      );

      const [blogPostAddress] = getBlogPostAddress(
        blogPost1,
        blogOwner1.publicKey,
        program.programId
      );

      const [commentAddress] = getCommentAddress(
        blogPostAddress,
        commentAuthor1.publicKey,
        program.programId
      );

      let failed = false;
      try {
        await program.methods
          .addComment(blogPost1, commentContent2)
          .accounts({
            commentAuthor: commentAuthor1.publicKey,
            comment: commentAddress,
            blogPost: blogPostAddress,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([commentAuthor1])
          .rpc();
      } catch (err: any) {
        failed = true;
        expect(err.message).to.include("simulation failed");
      }
      expect(failed).to.be.true;
    });

    it("should fail to add a comment to a nonexistent blog post", async () => {
      const [blogAddress] = getBlogAddress(
        blogTitle1,
        blogOwner1.publicKey,
        program.programId
      );

      const [blogPostAddress] = getBlogPostAddress(
        blogPost01,
        blogOwner1.publicKey,
        program.programId
      );

      const [commentAddress] = getCommentAddress(
        blogPostAddress,
        commentAuthor1.publicKey,
        program.programId
      );

      let failed = false;
      try {
        await program.methods
          .addComment(blogPost01, commentContent2)
          .accounts({
            commentAuthor: commentAuthor1.publicKey,
            comment: commentAddress,
            blogPost: blogPostAddress,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([commentAuthor1])
          .rpc();
      } catch (err: any) {
        failed = true;
        expect(err.message).to.include("AccountNotInitialized.");
      }
      expect(failed).to.be.true;
    });

    it("should fail to add a comment with an unauthorized signer", async () => {
      const [blogAddress] = getBlogAddress(
        blogTitle1,
        blogOwner1.publicKey,
        program.programId
      );

      const [blogPostAddress] = getBlogPostAddress(
        blogPost1,
        blogOwner1.publicKey,
        program.programId
      );

      const [commentAddress] = getCommentAddress(
        blogPostAddress,
        commentAuthor1.publicKey,
        program.programId
      );
      let failed = false;
      try {
        await program.methods
          .addComment(blogPost1, commentContent1)
          .accounts({
            commentAuthor: commentAuthor1.publicKey,
            comment: commentAddress,
            blogPost: blogPostAddress,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([commentAuthor2])
          .rpc();
      } catch (err: any) {
        failed = true;
        expect(err.message).to.include("unknown signer");
      }
      expect(failed).to.be.true;
    });
  });

  describe("remove comment", async () => {
    it("Should successfully remove a comment from blog post when the signer is the comment author", async () => {
      const [blogPostAddress] = getBlogPostAddress(
        blogPost1,
        blogOwner1.publicKey,
        program.programId
      );

      const [commentAddress] = getCommentAddress(
        blogPostAddress,
        commentAuthor1.publicKey,
        program.programId
      );

      await program.methods
        .deleteComment(blogPost1)
        .accounts({
          signer: commentAuthor1.publicKey,
          comment: commentAddress,
          blogPost: blogPostAddress,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([commentAuthor1])
        .rpc();

      const blogPostAccount = await program.account.blogPost.fetch(
        blogPostAddress
      );

      expect(blogPostAccount.numberOfComments.eq(new anchor.BN(0))).to.be.true;
    });

    it("Should successfully remove a comment from blog post when the signer is the blog owner", async () => {
      const [blogPostAddress] = getBlogPostAddress(
        blogPost2,
        blogOwner1.publicKey,
        program.programId
      );

      const [commentAddress] = getCommentAddress(
        blogPostAddress,
        commentAuthor1.publicKey,
        program.programId
      );

      await program.methods
        .deleteComment(blogPost2)
        .accounts({
          signer: commentAuthor1.publicKey,
          comment: commentAddress,
          blogPost: blogPostAddress,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([commentAuthor1])
        .rpc();

      const blogPostAccount = await program.account.blogPost.fetch(
        blogPostAddress
      );

      expect(blogPostAccount.numberOfComments.eq(new anchor.BN(0))).to.be.true;
    });

    it("Should fail to remove a comment from blog post when the signer unauthorized", async () => {
      const [blogPostAddress] = getBlogPostAddress(
        blogPost1,
        blogOwner1.publicKey,
        program.programId
      );

      const [commentAddress] = getCommentAddress(
        blogPostAddress,
        commentAuthor1.publicKey,
        program.programId
      );

      const [blogAddress] = getBlogAddress(
        blogTitle1,
        blogOwner1.publicKey,
        program.programId
      );

      let failed = false;
      try {
        await program.methods
          .addComment(blogPost1, commentContent1)
          .accounts({
            commentAuthor: commentAuthor1.publicKey,
            comment: commentAddress,
            blogPost: blogPostAddress,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([commentAuthor1])
          .rpc();

        await program.methods
          .deleteComment(blogPost1)
          .accounts({
            signer: commentAuthor1.publicKey,
            comment: commentAddress,
            blogPost: blogPostAddress,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([commentAuthor2])
          .rpc();
      } catch (err: any) {
        failed = true;
        expect(err.message).to.include("unknown signer");
      }
      expect(failed).to.be.true;
    });
  });
});

function getBlogAddress(title: String, owner: PublicKey, programID: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(title), owner.toBuffer()],
    programID
  );
}

function getBlogPostAddress(
  title: string,
  owner: PublicKey,
  programId: PublicKey
) {
  const titleHash = createHash("sha256").update(title).digest().slice(0, 32);
  return PublicKey.findProgramAddressSync(
    [titleHash, owner.toBuffer()],
    programId
  );
}

function getCommentAddress(
  blog_post_key: PublicKey,
  comment_author_key: PublicKey,
  programID: PublicKey
) {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("comment"),
      blog_post_key.toBytes(),
      comment_author_key.toBytes(),
    ],
    programID
  );
}
