use super::*;
use crate::errors::*;
use crate::states::*;
use anchor_lang::{prelude::*, solana_program::clock::UnixTimestamp};

pub fn handler(ctx: Context<AddComment>, blog_post_title: String, content: String) -> Result<()> {
    let comment = &mut ctx.accounts.comment;
    comment.blog_post = ctx.accounts.blog_post.key();
    comment.blog = ctx.accounts.blog.key();

    let blog_post = &mut ctx.accounts.blog_post;

    comment.comment_author = ctx.accounts.comment_author.key();
    comment.content = content;
    comment.created_at = Clock::get().unwrap().unix_timestamp;
    comment.bump = ctx.bumps.comment;

    blog_post.number_of_comments = blog_post.number_of_comments.checked_add(1).unwrap();

    Ok(())
}

#[derive(Accounts)]
#[instruction(blog_post_title: String, content: String)]
pub struct AddComment<'info> {
    #[account(mut)]
    pub comment_author: Signer<'info>,
    #[account(
        init,
        payer = comment_author,
        space = 8 + Comment::INIT_SPACE,
        seeds = [b"comment", blog_post.key().as_ref(), comment_author.key().as_ref()],
        bump
    )]
    pub comment: Account<'info, Comment>,
    #[account(
        mut,
        seeds = [&hash_string_content(&blog_post_title), blog_post.owner.key().as_ref()],
        bump
    )]
    pub blog_post: Account<'info, BlogPost>,
    #[account(
        mut,
        seeds = [blog.title.as_bytes(), blog.owner.key().as_ref()],
        bump,
        constraint = blog.owner == blog_post.owner @ BlogError::UnauthorizedOwner,
    )]
    pub blog: Account<'info, Blog>,
    pub system_program: Program<'info, System>,
}
