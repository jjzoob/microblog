import { microblog_backend } from "../../declarations/microblog_backend";
import { Principal } from "@dfinity/principal";
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "../../declarations/microblog_backend";

// 发布一条消息 post （结合otp,one time password,123456)
async function post() {
  let post_button = document.getElementById("post");
  post_button.disabled = true;
  let textarea = document.getElementById("message");

  let otp = document.getElementById("otp").value;
  let text = textarea.value;

  try {
    await microblog_backend.post(otp, text);
    textarea.value = "";
    await load_posts();
  } catch (err) {
    console.log(err);
    alert("Failed, please check OTP or console.");
  }
  post_button.disabled = false;
}

// 调取所有消息
let num_posts = 0;
async function load_posts() {
  let post_section = document.getElementById("posts");
  let posts = await microblog_backend.posts(0);

  if (num_posts == posts.length) return;
  post_section.replaceChildren([]);
  num_posts == posts.length;
  for (let i = 0; i < posts.length; i++) {
    let post = document.createElement("p");
    post.innerText =
      new Date(Math.round(parseInt(posts[i].time) / 1000000)).toLocaleString() +
      " ==> " +
      posts[i].text;
    post_section.appendChild(post);
  }
}

// 关注某一对象（结合otp,one time password,123456)
async function follow() {
  let follow_button = document.getElementById("btn_follow");
  follow_button.disabled = true;
  let followarea = document.getElementById("follow");

  let otp = document.getElementById("otp").value;
  let text = followarea.value;

  try {
    await microblog_backend.follow(otp, Principal.fromText(text));
    followarea.value = "";
    await load_follows();
  } catch (err) {
    console.log(err);
    alert("Failed, Please check OTP or console.");
  }
  follow_button.disabled = false;
}

// 调取所有关注对象
async function load_follows() {
  let follows_section = document.getElementById("my_follows");
  let follows = await microblog_backend.follows();
  follows_section.replaceChildren([]);

  for (let i = 0; i < follows.length; i++) {
    let actor = createCanister(follows[i]);
    let name = await actor.get_name();
    let posts = await actor.posts(0);
    let follow = document.createElement("details");
    let summary = document.createElement("summary");
    summary.innerHTML = name + " : " + follows[i];
    let msgTable = document.createElement("table");
    posts.forEach((post) => {
      let row = msgTable.insertRow(0);
      let cell1 = row.insertCell(0);
      let cell2 = row.insertCell(1);
      cell1.innerText = post.text;
      cell2.innerText = new Date(
        Math.round(parseInt(post.time) / 1000000)
      ).toLocaleString();
    });

    follow.appendChild(summary);
    follow.appendChild(msgTable);

    follows_section.appendChild(follow);
  }
}

// 调取所有关注对象发布的所有消息
async function load_timeline() {
  let timeline_section = document.getElementById("my_timeline");
  let posts = await microblog_backend.timeline(0);

  timeline_section.replaceChildren([]);

  for (let i = 0; i < posts.length; i++) {
    let post = document.createElement("p");
    post.innerText =
      posts[i].author +
      " : " +
      new Date(Math.round(parseInt(posts[i].time) / 1000000)).toLocaleString() +
      " ==> " +
      posts[i].text;
    timeline_section.appendChild(post);
  }
}

// 设置作者的名字（结合otp,one time password,123456)
async function set_name() {
  let set_name_button = document.getElementById("set_name");
  set_name_button.disabled = true;
  let namearea = document.getElementById("name");

  let otp = document.getElementById("otp").value;
  let text = namearea.value;

  try {
    await microblog_backend.set_name(otp, text);
    namearea.value = "";
    await load_name();
  } catch (err) {
    console.log(err);
    alert("Failed, Please check OTP or console.");
  }
  set_name_button.disabled = false;
}

// 调取作者的名字
async function load_name() {
  let name = await microblog_backend.get_name();
  let canisterId = await microblog_backend.getCanisterId();
  document.getElementById("who").innerText = name + "'s Blog";
  document.getElementById("canisterId").innerText =
    "Canister ID: " + canisterId;
}

// 创建Canister（根据Canister ID )
function createCanister(canisterId) {
  let agent = new HttpAgent();
  //agent.fetchRootKey();
  let canister = Actor.createActor(idlFactory, {
    agent: agent,
    canisterId: canisterId,
  });
  return canister;
}

// 页面渲染，调取必要的数据
async function load() {
  let post_button = document.getElementById("post");
  let set_name_button = document.getElementById("set_name");
  let follow_button = document.getElementById("btn_follow");
  set_name_button.onclick = set_name;
  post_button.onclick = post;
  follow_button.onclick = follow;
  await load_name();
  await load_posts();
  await load_follows();
  await load_timeline();
  setInterval(await load_timeline(), 3000);
}

window.onload = load;
