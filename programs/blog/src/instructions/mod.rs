use anchor_lang::{prelude::*, solana_program::hash::hash};

pub mod add_comment;
pub mod create_blog_post;
pub mod delete_blog_post;
pub mod delete_comment;
pub mod initialize_blog;
pub mod update_blog_post;

pub use add_comment::*;
pub use create_blog_post::*;
pub use delete_blog_post::*;
pub use delete_comment::*;
pub use initialize_blog::*;
pub use update_blog_post::*;

pub fn hash_string_content(content: &str) -> [u8; 32] {
    let hash = hash(content.as_bytes());
    hash.to_bytes()
}
