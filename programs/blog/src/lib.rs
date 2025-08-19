pub mod constants;
pub mod errors;
pub mod instructions;
pub mod states;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use states::*;

declare_id!("CYBkgWa5TTmAYkYZwJFdP8Br71HWkigFLLQuYFdGZ9YW");

#[program]
pub mod blog {
    use super::*;

    pub fn initialize_blog(
        ctx: Context<InitializeBlog>,
        title: String,
        description: String,
    ) -> Result<()> {
        initialize_blog::handler(ctx, title, description)
    }

    pub fn create_blog_post(
        ctx: Context<CreateBlogPost>,
        title: String,
        content: String,
    ) -> Result<()> {
        create_blog_post::handler(ctx, title, content)
    }

    pub fn update_blog_post(
        ctx: Context<UpdateBlogPost>,
        _title: String,
        content: String,
    ) -> Result<()> {
        update_blog_post::handler(ctx, _title, content)
    }

    pub fn delete_blog_post(ctx: Context<DeleteBlogPost>, _title: String) -> Result<()> {
        delete_blog_post::handler(ctx, _title)
    }

    pub fn add_comment(
        ctx: Context<AddComment>,
        blog_post_title: String,
        content: String,
    ) -> Result<()> {
        add_comment::handler(ctx, blog_post_title, content)
    }

    pub fn delete_comment(ctx: Context<DeleteComment>, blog_post_title: String) -> Result<()> {
        delete_comment::handler(ctx, blog_post_title)
    }
}
