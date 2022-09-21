import List "mo:base/List";
import Iter "mo:base/Iter";
import Principal "mo:base/Principal";
import Time "mo:base/Time";

actor class () = this {
  public type Message = { author:Principal; text : Text; time : Time.Time };

  public type Microblog = actor {
    follow : shared (Principal) -> async ();// 添加关注对象  
    follows : shared query () -> async [Principal];// 返回关注列表
    post : shared (Text) -> async ();// 发布新消息
    posts : shared query (Time.Time) -> async [Message];// 返回所有发布的消息
    timeline : shared (Time.Time) -> async [Message];// 返回所有关注对象发布的消息
    set_name: shared (Text) -> async (); // 设置作者名字
    get_name: shared query () -> async ?Text; // 返回作者名字
  };

  stable var followed : List.List<Principal> = List.nil();

  public shared func follow(otp : Text, id : Principal) : async () {
    assert(otp == "123456");
    //将权限限制为当前开发者：dfx identity get-principal获取
    // assert(Principal.toText(msg.caller) =="cpmdn-m34ck-oqgyz-jqnee-ujxlg-ejnpq-arqlp-o2ow7-5lqmr-xi7su-nqe");
    
    // 避免重复follow
    if (List.some(followed, func(listID : Principal) : Bool { id == listID })) return;
    
    followed := List.push(id, followed);// push是在List最前面插入
  };

  public shared query func follows() : async [Principal] {
    List.toArray(followed);
  };
  
  public query func getCanisterId() : async Principal {
    return Principal.fromActor(this);
  };

  stable var messages : List.List<Message> = List.nil();

  public shared (msg) func post(otp : Text, text : Text) : async () {
    assert(otp == "123456");
    //将权限限制为当前开发者：dfx identity get-principal获取
    // assert(Principal.toText(msg.caller) =="cpmdn-m34ck-oqgyz-jqnee-ujxlg-ejnpq-arqlp-o2ow7-5lqmr-xi7su-nqe");
    let new_post : Message = { 
          author = Principal.fromActor(this) ;
          text = text; 
          time = Time.now() ;//该时间为从1970-01-01到现在经历的纳秒数，类型为Int
    };
    messages := List.push(new_post, messages);
  };

  public shared query func posts(since : Time.Time) : async [Message] {
    var sinceMsg : List.List<Message> = List.nil();
    for (msg in Iter.fromList(messages)) {
      if (msg.time > since) {
        sinceMsg := List.push(msg, sinceMsg);
      };
    };
    List.toArray(sinceMsg);
  };

  public shared func timeline(since : Time.Time) : async [Message] {

    var all : List.List<Message> = List.nil();

    for (id in Iter.fromList(followed)) {
      let canister : Microblog = actor (Principal.toText(id));
      let msgs = await canister.posts(since);
      for (msg in Iter.fromArray(msgs)) {
        all := List.push(msg, all);
      };
    };

    List.toArray(all);
  };

  stable var name : ?Text = null;

  public shared func set_name(otp : Text, new_name: Text) { 
    assert(otp == "123456");
    //将权限限制为当前开发者：dfx identity get-principal获取
    // assert(Principal.toText(msg.caller) =="cpmdn-m34ck-oqgyz-jqnee-ujxlg-ejnpq-arqlp-o2ow7-5lqmr-xi7su-nqe");
    name :=?new_name 
  };

  public shared query func get_name() : async ?Text { 
    name 
  };

};
