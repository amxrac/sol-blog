use super::*;
use crate::errors::*;
use crate::states::*;
use anchor_lang::prelude::*;

pub fn handler(ctx: Context<DeleteComment>, blog_post_title: String) -> Result<()> {
    let signer = ctx.accounts.signer.key();
    let comment = &ctx.accounts.comment;
    let blog_post = &mut ctx.accounts.blog_post;

    require!(
        signer == comment.comment_author || signer == blog_post.owner,
        BlogError::UnauthorizedOwner
    );

    blog_post.number_of_comments = blog_post
        .number_of_comments
        .checked_sub(1)
        .ok_or(BlogError::Underflow)?;

    Ok(())
}

#[derive(Accounts)]
#[instruction(blog_post_title: String)]
pub struct DeleteComment<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        mut,
        close = signer,
        seeds = [b"comment", blog_post.key().as_ref(), comment.comment_author.key().as_ref()],
        bump
    )]
    pub comment: Account<'info, Comment>,
    #[account(
        mut,
        seeds = [&hash_string_content(&blog_post_title), blog_post.owner.key().as_ref()],
        bump
    )]
    pub blog_post: Account<'info, BlogPost>,
    pub system_program: Program<'info, System>,
}
