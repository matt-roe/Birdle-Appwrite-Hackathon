import { Appwrite, Models, Query } from "appwrite";

const appwrite = new Appwrite();
appwrite
  .setEndpoint(window.__NUXT__.config.public.apiBase)
  .setProject(window.__NUXT__.config.public.project);

export type PostWithoutContent = {
  name: string;
  subtitle: string;
  user_id: number;
  status: string;
  pub_id: string;
  created_at: string;
  postUrl: string;
  imgUrl: string;
  readTime: string;
} & Models.Document;

export type UserData = {
  username: string;
  img: string;
} & Models.Document;

export const userService = () => {
  const profileCollection = window.__NUXT__.config.public.profileCollection;
  const userDataCollection = window.__NUXT__.config.public.userDataCollection;
  const publicationCollection = window.__NUXT__.config.public.publicationCollection;
  const postsCollection = window.__NUXT__.config.public.postsCollection;
  const userStorageBucket = window.__NUXT__.config.public.userStorageBucket;
  const pubStorageBucket = window.__NUXT__.config.public.pubStorageBucket;

  async function getAuthStatus(): Promise<boolean> {
    try {
      await appwrite.account.get();
      return true;
    } catch (err) {
      // If there is error, I believe it's 4XX error and it means user is not logged
      // TODO: I should expect 5XX errors here better

      return false;
    }
  }

  async function publishThePost(
    postName: string,
    content: string,
    subtitle: string,
    status: string,
    pub: string,
    url: string,
    img: string,
    readingTime: string,
    userId: string,
    username: string,
    tagsArray: Array,
    pubName: string,
    postUserName: string,
    userImage: string,
    pubImage: string,
    tag
  ): Promise<boolean> {
    console.log(url, img);
    try {
      //const { $id: userId, } = await appwrite.account.get();
      //const currentUserData = await getUserNameFromUserID(userId.toString())

      await appwrite.database.createDocument(postsCollection, "unique()", {
        user_id: userId,
        name: postName.toString(),
        subtitle: subtitle.toString(),
        content: content.toString(),
        status: status.toString(),
        pub_id: pub.toString(),
        postUrl: url,
        imgUrl: img,
        readTime: readingTime,
        tags: tagsArray,
        created_at: Math.round(Date.now() / 1000).toString(),
        username: postUserName.toString(),
        pubname: pubName.toString(),
        userimg: userImage.toString(),
        pubimg: pubImage.toString(),
        published: tag,
      });
      return true;
    } catch (err: any) {
      alert(err.message);
      return false;
    }
  }

  async function getuserIdFromUsername(userName: string): string {
    try {
      const userData = await appwrite.database.listDocuments(
        userDataCollection,
        [Query.equal("username", userName)]
      );
      return userData.documents[0];
    } catch (err: any) {
      alert(err.message);
      return false;
    }
  }

  async function getUserWithPosts(userName: string) {
    try {
      const info = await getuserIdFromUsername(userName);
      const id = info.$id.toString();
      const posts = await appwrite.database.listDocuments(postsCollection, [
        Query.equal("user_id", id),
      ]);

      return { posts, info };
    } catch (err: any) {
      alert(err.message);
      return false;
    }
  }

  async function getAuthorPost(userName: string, blogurl: string) {
    try {
      console.log("PRINTING USERNAME BLOGURL", userName, blogurl);

      const info = await getuserIdFromUsername(userName);
      const id = info.$id.toString();
      console.log(id);
      console.log("USER INFO",info)
      const post = await appwrite.database.listDocuments(postsCollection, [
        Query.equal("postUrl", "/@" + userName + "/" + blogurl),
      ]);

      console.log("POS AFTER", post);
      console.log("IDS", post.documents[0].user_id,id)
      if (post.documents[0].user_id === id) {
        console.log("SAME ID");
        return { post, info };
      } else {
        console.log("NOT SAMW");
        alert("POST NOT FOUNT");
      }
    } catch (err: any) {
      alert(err.message);
      return false;
    }
  }

  async function getUserNameFromUserID(id: string): string {
    try {
      const userData = await appwrite.database.listDocuments(
        userDataCollection,
        [Query.equal("$id", id)]
      );
      return userData.documents[0];
    } catch (err: any) {
      alert(err.message);
      return false;
    }
  }

  async function currentUserData() {
    try {
      const user = await appwrite.account.get();
      const currentUserData = await getUserNameFromUserID(user.$id.toString());
      return currentUserData;
    } catch (err: any) {
      return false;
    }
  }

  async function uploadImage(file) {
    try {
      const sendImage = appwrite.storage.createFile(
        userStorageBucket,
        "unique()",
        file
      );
      return sendImage;
    } catch (err: any) {
      alert(err.message);
      return false;
    }
  }

  async function updateProfileDocument(id, obj) {
    try {
      const updateDoc = appwrite.database.updateDocument(
        userDataCollection,
        id.toString(),
        obj
      );
      return true;
    } catch (err: any) {
      alert(err.message);
      return false;
    }
  }

  async function test(): Promise<UserData> {
    const user = await appwrite.account.get();
    console.log(user.$id);
    const userData: Models.DocuementList<UserData> =
      await appwrite.database.listDocuments<UserData>(userDataCollection, [
        Query.equal("$id", user.$id),
      ]);
    return userData.documents[0];
  }

  async function setUpUserForPageReload() {
    try {
      const userInfo = await appwrite.account.get();
      const currentUserData = await getUserNameFromUserID(
        userInfo.$id.toString()
      );
      return { userInfo, currentUserData };
    } catch (err: any) {
      return false;
    }
  }

  async function getThumbnail(imageId: string): URL {
    return appwrite.storage.getFilePreview(
      profileCollection,
      imageId,
      500,
      undefined,
      "top",
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      "webp"
    );
  }

  async function getUserNameThumbnail(name): string {
    return appwrite.avatars.getInitials(name, 50, 50);
  }

  async function getPub(pubName: string) {
    try {
      const pub = await appwrite.database.listDocuments(publicationCollection, [
        Query.equal("url", pubName.toString()),
      ]);
      return pub.documents[0];
    } catch (err: any) {
      alert(err.message);
      return false;
    }
  }

  async function getPubWithPosts(pubName: string) {
    try {
      const pub = await getPub(pubName);
      const id = pub.$id.toString();
      console.log(id);
      const posts = await appwrite.database.listDocuments(postsCollection, [
        Query.equal("pub_id", id),
      ]);

      return { pub, posts };
    } catch (err: any) {
      alert(err.message);
      return false;
    }
  }

  async function getPostWithPubAuthorData(publication, url) {
    const urlString = "/" + publication + "/" + url;
    console.log(urlString);
    console.log("PUB", publication)
    const pubInfo = await getPub(publication);

    const post = await appwrite.database.listDocuments(postsCollection, [
      Query.equal("postUrl", urlString),
    ]);

    const postInfo = post.documents[0];
    console.log("POST INFO", post);
    const userInfo = await getUserNameFromUserID(postInfo.user_id);
    return { pubInfo, userInfo, postInfo };
  }

  async function getPubsForAuthor(username: string) {
    try {
      const pub = await appwrite.database.listDocuments(publicationCollection, [
        Query.search("writers", [username.toString()]),
      ]);
      return pub;
    } catch (err: any) {
      alert(err.message);
      return false;
    }
  }

  async function getPosts() {
    try {
      const postList = await appwrite.database.listDocuments(
        postsCollection,
        [],
        20,
        undefined,
        undefined,
        undefined,
        undefined,
        ["DESC"]
      );
      return postList;
    } catch (err: any) {
      const postList = [];
      alert(err.message);
      return postList;
    }
  }

  async function addFollower(id: string, type: string) {
    try {
      let getDocument = await appwrite.database.getDocument(
        userDataCollection,
        id.toString()
      );
      console.log("RECEIVED DOC", getDocument);
      if (type === "increase") {
        getDocument["followers_count"] += 1;
      } else {
        getDocument["followers_count"] -= 1;
      }

      console.log("OBJECT", getDocument);
      const updateDoc = await appwrite.database.updateDocument(
        userDataCollection,
        id.toString(),
        getDocument
      );
      console.log(updateDoc);
      return true;
    } catch (err: any) {
      alert(err.message);
      console.log(err);
      return false;
    }
  }

  async function addPubFollower(id: string, type: string) {
    try {
      let getDocument = await appwrite.database.getDocument(
        publicationCollection,
        id.toString()
      );
      console.log("RECEIVED DOC", getDocument);
      if (type === "increase") {
        getDocument["followers_count"] += 1;
      } else {
        getDocument["followers_count"] -= 1;
      }

      console.log("OBJECT", getDocument);
      const updateDoc = await appwrite.database.updateDocument(
        publicationCollection,
        id.toString(),
        getDocument
      );
      console.log(updateDoc);
      return true;
    } catch (err: any) {
      alert(err.message);
      console.log(err);
      return false;
    }
  }

  async function getCurrentUserPosts(userID: string) {
    try {
      const posts = await appwrite.database.listDocuments(
        postsCollection,
        [Query.equal("user_id", userID.toString())],
        20,
        undefined,
        undefined,
        undefined,
        undefined,
        ["DESC"]
      );
      return posts;
    } catch (err) {
      alert(err.message);
      console.log(err);
      return false;
    }
  }

  async function deletePost(ID: string) {
    try {
      const posts = await appwrite.database.deleteDocument(postsCollection, ID);
      return true;
    } catch (err) {
      alert(err.message);
      console.log(err);
      return false;
    }
  }

  async function getSinglePostDoc(ID: string) {
    try {
      const post = await appwrite.database.getDocument(postsCollection, ID);
      return post;
    } catch (err) {
      alert(err.message);
      console.log(err);
      return false;
    }
  }

  async function updateThePost(
    postName: string,
    content: string,
    subtitle: string,
    status: string,
    pub: string,
    url: string,
    img: string,
    readingTime: string,
    userId: string,
    username: string,
    tagsArray: Array,
    pubName: string,
    postUserName: string,
    userImage: string,
    pubImage: string,
    tag,
    post_id
  ): Promise<boolean> {
    console.log(url, img);
    try {
      // const { $id: userId, } = await appwrite.account.get();
      // const currentUserData = await getUserNameFromUserID(userId.toString())

      await appwrite.database.updateDocument(postsCollection, post_id, {
        user_id: userId,
        name: postName.toString(),
        subtitle: subtitle.toString(),
        content: content.toString(),
        status: status.toString(),
        pub_id: pub.toString(),
        postUrl: url,
        imgUrl: img,
        readTime: readingTime,
        tags: tagsArray,
        created_at: Math.round(Date.now() / 1000).toString(),
        username: postUserName.toString(),
        pubname: pubName,
        userimg: userImage.toString(),
        pubimg: pubImage,
        published: tag,
      });
      return true;
    } catch (err: any) {
      alert(err.message);
      console.log(err);
      return false;
    }
  }

  async function getFollowers(list) {
    try {
      const userData = await appwrite.database.listDocuments(
        userDataCollection,
        [Query.equal("$id", list)]
      );
      return userData;
    } catch (err: any) {
      alert(err.message);
      console.log(err);
      return false;
    }
  }

  async function getPostsWithTag(tagName) {
    console.log(tagName);
    try {
      const getTagPosts = await appwrite.database.listDocuments(
        postsCollection,
        [Query.search("tags", tagName)]
      );
      return getTagPosts;
    } catch (err: any) {
      alert(err.message);
      console.log(err);
      return false;
    }
  }

  async function getzHomeFreePosts() {
    try {
      const postList = await appwrite.database.listDocuments(
        postsCollection,
        [],
        10,
        undefined,
        undefined,
        undefined,
        undefined,
        ["ASC"]
      );
      return postList;
    } catch (err: any) {
      alert(err.message);
      return false;
    }
  }

  async function currentAuthorPubs(userID: string, username: string) {
    try {
      const pub = await appwrite.database.listDocuments(publicationCollection, [
        Query.search("writers", [username.toString()]),
        Query.equal("user_id", userID.toString()),
      ]);
      return pub;
    } catch (err: any) {
      alert(err.message);
      return false;
    }
  }

  async function uploadImagePub(file) {
    try {
      const sendImage = appwrite.storage.createFile(
        pubStorageBucket,
        "unique()",
        file
      );
      return sendImage;
    } catch (err: any) {
      alert(err.message);
      return false;
    }
  }

  async function createPub(obj): Promise<boolean> {
    try {
      const createPublication = appwrite.database.createDocument(
        publicationCollection,
        "unique()",
        obj
      );
      console.log(createPublication);

      return true;
    } catch (err: any) {
      alert(err.message);
      return false;
    }
  }

  async function updatePub(id,obj): Promise<boolean> {
    try {
      const createPublication = appwrite.database.updateDocument(
        publicationCollection,
        id,
        obj
      );
      console.log(createPublication);

      return true;
    } catch (err: any) {
      alert(err.message);
      return false;
    }
  }

    async function getPublication(id) {
    try {
      const getpub = appwrite.database.getDocument(
        publicationCollection,
        id
      );
      return getpub;

      return true;
    } catch (err: any) {
      alert(err.message);
      return false;
    }
  }

  async function deletePub(ID: string) {
    try {
      const pub = await appwrite.database.deleteDocument(publicationCollection, ID);
      return true;
    } catch (err) {
      alert(err.message);
      console.log(err);
      return false;
    }
  }
  

  return {
    appwrite,
    getAuthStatus,
    publishThePost,
    getUserWithPosts,
    getAuthorPost,
    currentUserData,
    uploadImage,
    getThumbnail,
    getUserNameThumbnail,
    updateProfileDocument,
    setUpUserForPageReload,
    getPubWithPosts,
    getPostWithPubAuthorData,
    getPubsForAuthor,
    getPosts,
    addFollower,
    addPubFollower,
    getCurrentUserPosts,
    deletePost,
    getSinglePostDoc,
    updateThePost,
    getFollowers,
    getPostsWithTag,
    getzHomeFreePosts,
    currentAuthorPubs,
    uploadImagePub,
    createPub,
    updatePub,
    getPublication,
    deletePub,
    test,
  };
};
